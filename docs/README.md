# 📚 PLP Contract Agreement System - Documentation Index

## 📖 Overview

This directory contains comprehensive documentation for the PLP Contract Agreement & M&E System.

---

## 📑 Documentation Files

### 1. 📋 [CONTRACTS_OVERVIEW.md](./CONTRACTS_OVERVIEW.md)
**Complete guide to all 5 Performance Agreements**

ឯកសារសំខាន់បំផុត! មានព័ត៌មានលម្អិតអំពីកិច្ចព្រមព្រៀងទាំង ៥ ប្រភេទ
Most important! Contains detailed information about all 5 agreement types including:
- គណបក្សពាក់ព័ន្ធ (Parties involved)
- គោលដៅ និងសូចនាករ (Objectives and indicators)
- ថវិកា (Budget ranges)
- ទំនាក់ទំនងរវាងកិច្ចព្រមព្រៀង (Agreement relationships)
- ការប្រើប្រាស់ប្រព័ន្ធ (System usage guide)

**📁 Final Documents Reference:**
- Contract 1: PMU-PCU Agreement
- Contract 2: PCU Chief - Project Manager
- Contract 3: Project Manager - Regional Officers
- Contract 4: Primary Dept - District Office
- Contract 5: Primary Dept - Primary School

---

### 2. 🚀 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
**Technical implementation summary**

ព័ត៌មានបច្ចេកទេស និងលក្ខណៈពិសេសដែលបានអនុវត្ត
Technical details and implemented features:
- M&E Database Extension (8 new tables)
- M&E Dashboard Interface
- Project Timeline & Deliverables
- Real Contract Data Implementation
- Dynamic Database-Driven System
- API Endpoints Documentation
- System Architecture Diagrams
- Statistics & Achievements

**For developers and system administrators**

---

### 3. 👥 [DEMO_USERS.md](./DEMO_USERS.md)
**Demo users and testing guide**

គណនីសាកល្បង សម្រាប់ការធ្វើតេស្ត
Demo accounts for testing the system:
- Super Admin access (077806680)
- Admin, Manager, Partner roles
- Login credentials
- Role-based testing scenarios

**For testers and quality assurance**

---

### 4. ⚠️ [API_ERROR_RESPONSES.md](./API_ERROR_RESPONSES.md)
**API documentation and error handling**

ឯកសារ API និងការគ្រប់គ្រងកំហុស
API documentation including:
- Error response formats
- Status codes
- Error handling best practices
- Common error scenarios
- Debugging tips

**For developers and API integration**

---

### 5. 🗺️ [geoapi.md](./geoapi.md)
**Geographic API integration**

ការបញ្ចូល API ភូមិសាស្រ្ត
Geographic data integration:
- Cambodia administrative divisions
- Province, District, Commune data
- API endpoints for location data

**For developers working with geographic features**

---

## 📁 Final PDR Documents Location

**Path:** `/pdr/Final/`

### ឯកសារចុងក្រោយទាំង ៥ (All 5 Final Documents):

1. **`1_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាង_គបស_និង_គបក_3_october.docx`**
   - 25,775 bytes | Microsoft Word 2007+
   - PMU-PCU Performance Agreement

2. **`2_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធានគ_ប_ក_និងប្រធានគម្រោង.docx`**
   - 28,712 bytes | Microsoft Word 2007+
   - PCU Chief - Project Manager Agreement

3. **`3_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធានគម្រោង_និងមន្រ្តីគម្រោង.docx`**
   - 94,257 bytes | Microsoft Word 2007+
   - Project Manager - Regional Officers Agreement (Most detailed)

4. **`4_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម_និងការិយាល័យអប់រំក្រុង.docx`**
   - 22,299 bytes | Microsoft Word 2007+
   - Primary Department - District Education Office Agreement

5. **`5_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម_និងសាលាបឋមសិក្សា.docx`**
   - 25,230 bytes | Microsoft Word 2007+
   - Primary Department - Primary School Agreement

---

## 🎯 Quick Start Guide

### សម្រាប់អ្នកប្រើប្រាស់ (For Users):
1. អាន [CONTRACTS_OVERVIEW.md](./CONTRACTS_OVERVIEW.md) ដើម្បីយល់ពីប្រព័ន្ធ
2. មើល [DEMO_USERS.md](./DEMO_USERS.md) ដើម្បីទទួលបានគណនីសាកល្បង
3. ចូលប្រើ https://agreements.openplp.com

### សម្រាប់អ្នកអភិវឌ្ឍន៍ (For Developers):
1. អាន [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) សម្រាប់ព័ត៌មានបច្ចេកទេស
2. មើល [API_ERROR_RESPONSES.md](./API_ERROR_RESPONSES.md) សម្រាប់ API
3. ពិនិត្យមើល `/prisma/schema.prisma` សម្រាប់ database schema

### សម្រាប់អ្នកគ្រប់គ្រង (For Administrators):
1. អាន [CONTRACTS_OVERVIEW.md](./CONTRACTS_OVERVIEW.md) ដើម្បីយល់ពីតួនាទី
2. មើល [DEMO_USERS.md](./DEMO_USERS.md) សម្រាប់ការគ្រប់គ្រងអ្នកប្រើ
3. ប្រើប្រាស់ `/admin/users` សម្រាប់ការគ្រប់គ្រង

---

## 🔗 Related Files

### ប្រព័ន្ធសំខាន់ៗ (Main System Files):
- `/README.md` - Project main README
- `/prisma/schema.prisma` - Database schema
- `/lib/contract-indicators.ts` - Contract indicators data
- `/lib/project-deliverables.ts` - Project timelines
- `/app/me-dashboard/page.tsx` - M&E Dashboard

---

## 📞 ការទំនាក់ទំនង (Contact & Support)

**Production URL:** https://agreements.openplp.com

**GitHub:** https://github.com/chhinhsovath/plp_contract_agreement

**Database Server:** 157.10.73.82:5432 (PostgreSQL)

---

## 📅 កាលបរិច្ឆេទធ្វើបច្ចុប្បន្នភាព (Last Updated)

**Date:** October 8, 2025

**Version:** 2.0.0

**Status:** Production Ready 🚀

---

## 📝 Notes

### ការរក្សាឯកសារ (Documentation Maintenance):
- ធ្វើបច្ចុប្បន្នភាពឯកសារនៅពេលមានការផ្លាស់ប្តូរសំខាន់
- រក្សាភាសាទាំងពីរ ខ្មែរ និងអង់គ្លេស
- ផ្តល់ព័ត៌មានលម្អិត និងច្បាស់លាស់

### ការប្រើប្រាស់ (Usage):
- ឯកសារទាំងនេះសម្រាប់ អ្នកប្រើ, អ្នកអភិវឌ្ឍន៍, និងអ្នកគ្រប់គ្រង
- អាចប្រើជា reference សម្រាប់ការបណ្តុះបណ្តាល
- មានព័ត៌មានបច្ចេកទេស និងព័ត៌មានអ្នកប្រើ

---

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
