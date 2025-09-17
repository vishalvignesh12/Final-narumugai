# Environment Configuration Guide

## For Different Access Scenarios:

### 1. Local Development (Same Device)
```env
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 2. Network Access (Other Devices on Same Network)
```env
# Replace with your actual network IP (currently showing 192.168.1.5 from terminal)
NEXT_PUBLIC_BASE_URL="http://192.168.1.5:3000"
```

### 3. Production Environment
```env
NEXT_PUBLIC_BASE_URL="https://narumugai.com"
```

### 4. Development with Network Access (Most Flexible)
```env
# This allows both localhost and network IP access
NEXT_PUBLIC_BASE_URL="http://0.0.0.0:3000"
```

## Dynamic Configuration

The new `lib/config.js` utility automatically handles:

- ✅ **Development Mode**: Uses localhost or network IP
- ✅ **Production Mode**: Uses production domain
- ✅ **Multi-device Access**: Supports different IPs
- ✅ **Fallback Handling**: Graceful degradation
- ✅ **Environment Detection**: Automatic switching

## Usage in Code:

```javascript
import { getBaseURL, getAPIBaseURL } from '@/lib/config'

// Get current base URL
const baseUrl = getBaseURL()

// Get API URL
const apiUrl = getAPIBaseURL()
```

## Quick Setup for Multi-Device Access:

1. **Find your network IP**:
   ```bash
   ipconfig /all
   ```

2. **Update .env.local**:
   ```env
   NEXT_PUBLIC_BASE_URL="http://YOUR_NETWORK_IP:3000"
   ```

3. **Restart server**:
   ```bash
   npm run dev
   ```

4. **Access from other devices**:
   ```
   http://YOUR_NETWORK_IP:3000
   ```