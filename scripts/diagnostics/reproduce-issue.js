
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually read .env
try {
    const envPath = path.resolve(__dirname, '.env');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    const lines = envConfig.split(/\r?\n/);
    for (const line of lines) {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let key = match[1];
            let value = match[2] || '';
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            } else if (value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    }
} catch (e) {
    console.log("Could not read .env file");
}

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    deletedAt: { type: Date, default: null, index: true },
}, { timestamps: true });

const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema, 'categories');

async function run() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is missing in .env");
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // 1. Create a dummy category
        const name = "Test Trash Category " + Date.now();
        const slug = "test-trash-category-" + Date.now();
        const newCat = await CategoryModel.create({ name, slug });
        console.log("Created category:", newCat._id);

        // 2. Soft delete it
        await CategoryModel.updateOne({ _id: newCat._id }, { $set: { deletedAt: new Date().toISOString() } });
        console.log("Soft deleted category");

        // 3. Query for deleted items (PD logic)
        const matchQuery = { deletedAt: { $ne: null } };
        const found = await CategoryModel.find(matchQuery);
        console.log("Found deleted items count:", found.length);

        const isFound = found.some(c => c._id.toString() === newCat._id.toString());
        console.log("Is our test category found?", isFound);

        // 4. Clean up
        await CategoryModel.deleteOne({ _id: newCat._id });
        console.log("Cleaned up");

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
