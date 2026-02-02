# Extraction Checklist

## ✅ Pre-Extraction Verification

Run these commands to verify everything is ready:

```bash
cd scripts/omnivore-content-system

# 1. Dependencies resolved
pnpm install
# Should complete without errors

# 2. TypeScript compiles
pnpm run build
# Should create dist/ directory

# 3. Type checking passes
pnpm run typecheck
# Should show no errors

# 4. Omnivore client works
node lib/omnivore/client.js --test
# Should connect and show user info
```

## 📦 Extraction Commands

```bash
# From omnivore repo root
cd /Volumes/devel/personal/keybase/edgerouter/mac-mini/home/omnivore/omnivore

# Copy to new location
cp -r scripts/omnivore-content-system /path/to/new-location/

# OR move (if extracting permanently)
mv scripts/omnivore-content-system /path/to/new-location/
```

## 🔧 Post-Extraction Setup

```bash
cd /path/to/new-location/omnivore-content-system

# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Test connection
node lib/omnivore/client.js --test

# 4. Verify build
pnpm run build
pnpm run typecheck

# 5. Initialize Git (if new repo)
git init
git add .
git commit -m "Initial commit: Omnivore content monetization system"
```

## 🔍 Verification After Extraction

### Check 1: No External Dependencies
```bash
# Should find no references to parent repo paths
grep -r "\.\./\.\./self-hosting" .
grep -r "omnivore/scripts" .
# Both should return no results (or only in IMPLEMENTATION_PLAN.md for documentation)
```

### Check 2: All Files Present
```bash
# Required files
ls -la .env.example         # ✅ Should exist
ls -la package.json         # ✅ Should exist
ls -la tsconfig.json        # ✅ Should exist
ls -la .gitignore           # ✅ Should exist
ls -la README.md            # ✅ Should exist
ls -la IMPLEMENTATION_PLAN.md  # ✅ Should exist
ls -la CLAUDE.md            # ✅ Should exist

# Required directories
ls -d lib/                  # ✅ Should exist
ls -d src/                  # ✅ Should exist
ls -d content/              # ✅ Should exist
```

### Check 3: Build Works
```bash
pnpm run build
# Should succeed and create dist/types/
ls -la dist/
```

### Check 4: Client Works
```bash
# After configuring .env with real API keys
node lib/omnivore/client.js --test
# Should output:
# ✅ Connected to Omnivore API
#    User: Your Name (your@email.com)
#    Username: yourusername
```

## ❌ What Should NOT Be Included

These remain in the omnivore repo:
- ❌ `/scripts/migrate-omnivore.js`
- ❌ `/scripts/import-pocket.js`
- ❌ `/self-hosting/` directory
- ❌ Parent repo's package.json

## 📝 Final Checklist

Before considering extraction complete:

- [ ] All dependencies install without errors
- [ ] TypeScript compiles successfully
- [ ] Type checking passes with no errors
- [ ] Omnivore client connects to API
- [ ] .env.example is present with correct structure
- [ ] README.md reflects current status
- [ ] IMPLEMENTATION_PLAN.md is up to date
- [ ] .gitignore properly configured
- [ ] No symlinks to parent repo
- [ ] No hardcoded paths to parent repo structure

## 🚀 Ready When

All checkboxes above are checked ✅

## 📚 Documentation References

- [README.md](./README.md) - Overview and quick start
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Detailed roadmap
- [CLAUDE.md](./CLAUDE.md) - Agent context and strategy
