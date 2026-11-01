import { z } from 'zod'

const addressFields = {
  recipientName: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^\+91[6-9][0-9]{9}$/),
  line1: z.string().trim().min(1).max(240),
  line2: z.string().trim().max(240).nullable().optional(),
  landmark: z.string().trim().max(120).nullable().optional(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().regex(/^[1-9][0-9]{5}$/),
  isDefault: z.boolean().optional(),
}

const createAddressSchema = z.object(addressFields).strict()
const updateAddressSchema = z.object(Object.fromEntries(
  Object.entries(addressFields).map(([key, schema]) => [key, schema.optional()]),
)).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one address field must be provided.',
})
const addressIdSchema = z.string().uuid()

export class AddressValidationError extends Error {
  constructor() {
    super('Address input is invalid.')
    this.name = 'AddressValidationError'
  }
}

export class AddressNotFoundError extends Error {
  constructor() {
    super('Address was not found.')
    this.name = 'AddressNotFoundError'
  }
}

export class AddressConflictError extends Error {
  constructor() {
    super('The default address changed concurrently. Please retry.')
    this.name = 'AddressConflictError'
  }
}

function parse(schema, input) {
  const result = schema.safeParse(input)
  if (!result.success) throw new AddressValidationError()
  return result.data
}

function parseId(addressId) {
  const result = addressIdSchema.safeParse(addressId)
  if (!result.success) throw new AddressValidationError()
  return result.data
}

function isAddressConflict(error) {
  return error?.code === 'P2002' || error?.code === 'P2034'
}

export function createAddressService({ repository }) {
  if (
    typeof repository?.listByUserId !== 'function' ||
    typeof repository?.createForUser !== 'function' ||
    typeof repository?.updateForUser !== 'function' ||
    typeof repository?.deleteForUser !== 'function'
  ) {
    throw new TypeError('Address repository must implement listByUserId, createForUser, updateForUser, and deleteForUser.')
  }

  return {
    list(userId) {
      return repository.listByUserId(userId)
    },

    async create(userId, input) {
      const data = parse(createAddressSchema, input)
      try {
        return await repository.createForUser(userId, { ...data, isDefault: data.isDefault ?? false })
      } catch (error) {
        if (isAddressConflict(error)) throw new AddressConflictError()
        throw error
      }
    },

    async update(userId, addressId, input) {
      const id = parseId(addressId)
      const data = parse(updateAddressSchema, input)
      try {
        const address = await repository.updateForUser(userId, id, data)
        if (!address) throw new AddressNotFoundError()
        return address
      } catch (error) {
        if (error instanceof AddressNotFoundError) throw error
        if (isAddressConflict(error)) throw new AddressConflictError()
        throw error
      }
    },

    async remove(userId, addressId) {
      const id = parseId(addressId)
      const removed = await repository.deleteForUser(userId, id)
      if (!removed) throw new AddressNotFoundError()
      return { success: true }
    },
  }
}
