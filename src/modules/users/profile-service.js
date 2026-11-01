import { z } from 'zod'

const profilePatchSchema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().toLowerCase().email().max(320).nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one profile field must be provided.',
})

export class ProfileValidationError extends Error {
  constructor() {
    super('Profile update is invalid.')
    this.name = 'ProfileValidationError'
  }
}

export class ProfileNotFoundError extends Error {
  constructor() {
    super('Profile was not found.')
    this.name = 'ProfileNotFoundError'
  }
}

export class ProfileEmailConflictError extends Error {
  constructor() {
    super('Email address is already in use.')
    this.name = 'ProfileEmailConflictError'
  }
}

function parsePatch(input) {
  const result = profilePatchSchema.safeParse(input)
  if (!result.success) throw new ProfileValidationError()
  return result.data
}

function isUniqueEmailConflict(error) {
  return error?.code === 'P2002' &&
    (error?.meta?.target === 'email' || error?.meta?.target?.includes?.('email'))
}

export function createProfileService({ repository }) {
  if (typeof repository?.findById !== 'function' || typeof repository?.updateById !== 'function') {
    throw new TypeError('Profile repository must implement findById and updateById.')
  }

  return {
    async get(userId) {
      const profile = await repository.findById(userId)
      if (!profile) throw new ProfileNotFoundError()
      return profile
    },

    async update(userId, input) {
      const patch = parsePatch(input)
      try {
        const profile = await repository.updateById(userId, patch)
        if (!profile) throw new ProfileNotFoundError()
        return profile
      } catch (error) {
        if (error instanceof ProfileNotFoundError) throw error
        if (isUniqueEmailConflict(error)) throw new ProfileEmailConflictError()
        throw error
      }
    },
  }
}
