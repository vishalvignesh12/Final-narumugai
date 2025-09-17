#!/usr/bin/env node

/**
 * Script to configure the app for multi-device network access
 * Usage: node scripts/set-network-access.js [IP_ADDRESS]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function getNetworkIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if ('IPv4' !== iface.family || iface.internal !== false) {
                continue;
            }
            return iface.address;
        }
    }
    return 'localhost';
}

function updateEnvFile(ipAddress) {
    const envPath = path.join(process.cwd(), '.env.local');
    
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local file not found!');
        process.exit(1);
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update the base URL
    const newBaseUrl = `http://${ipAddress}:3000`;
    const newApiUrl = `http://${ipAddress}:3000/api`;
    
    // Replace the URLs
    envContent = envContent.replace(
        /NEXT_PUBLIC_BASE_URL="[^"]*"/,
        `NEXT_PUBLIC_BASE_URL="${newBaseUrl}"`
    );
    envContent = envContent.replace(
        /NEXT_PUBLIC_API_BASE_URL="[^"]*"/,
        `NEXT_PUBLIC_API_BASE_URL="${newApiUrl}"`
    );
    
    // Write back to file
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Environment configuration updated successfully!');
    console.log(`📱 Base URL: ${newBaseUrl}`);
    console.log(`🌐 API URL: ${newApiUrl}`);
    console.log('');
    console.log('📋 Access instructions:');
    console.log(`   • Local access: http://localhost:3000`);
    console.log(`   • Network access: ${newBaseUrl}`);
    console.log('');
    console.log('🔄 Please restart your development server:');
    console.log('   npm run dev');
}

function main() {
    const args = process.argv.slice(2);
    let targetIP = args[0];
    
    if (!targetIP) {
        targetIP = getNetworkIP();
        console.log(`🔍 Auto-detected network IP: ${targetIP}`);
    } else {
        console.log(`🎯 Using provided IP: ${targetIP}`);
    }
    
    if (targetIP === 'localhost') {
        console.log('⚠️  Could not detect network IP. Using localhost.');
        console.log('💡 You can manually specify an IP: node scripts/set-network-access.js 192.168.1.5');
    }
    
    updateEnvFile(targetIP);
}

if (require.main === module) {
    main();
}

module.exports = { updateEnvFile, getNetworkIP };