# ប្រព័ន្ធកិច្ចព្រមព្រៀងសមិទ្ធកម្ម PLP
# PLP Contract Agreement System

ប្រព័ន្ធគ្រប់គ្រងកិច្ចព្រមព្រៀងសមិទ្ធកម្មសម្រាប់គម្រោង PLP ដែលអនុញ្ញាតឱ្យអ្នកប្រើបង្កើត និងចុះហត្ថលេខាលើកិច្ចព្រមព្រៀងប្រភេទផ្សេងៗ។

## មុខងារសំខាន់ៗ

- ✅ គាំទ្រកិច្ចព្រមព្រៀង 5 ប្រភេទ
- ✅ ចុះហត្ថលេខាឌីជីថល (Digital Signature)
- ✅ ការបោះពុម្ពកិច្ចព្រមព្រៀង
- ✅ ការរក្សាទុកនិងគ្រប់គ្រងកិច្ចព្រមព្រៀង
- ✅ អន្តរមុខជាភាសាខ្មែរទាំងស្រុង

## បច្ចេកវិទ្យា

- **Framework**: Next.js 15 with TypeScript
- **UI Library**: Ant Design 5
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Signature**: React Signature Canvas
- **Deployment**: Vercel

## ការដំឡើង

### 1. Clone the repository

```bash
git clone [repository-url]
cd plp-contract-agreement
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

បង្កើតឯកសារ `.env` និងបំពេញព័ត៌មានដូចខាងក្រោម:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/plp_contracts?schema=public"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with contract types
npm run prisma:seed
```

### 5. Run the development server

```bash
npm run dev
```

បើកកម្មវិធី browser ហើយចូលទៅកាន់ [http://localhost:3000](http://localhost:3000)

## ប្រភេទកិច្ចព្រមព្រៀង (Contract Types)

### 📁 ឯកសារចុងក្រោយ (Final Documents)
ឯកសារអត្ថបទពេញលេញសម្រាប់កិច្ចព្រមព្រៀងទាំង ៥ មាននៅក្នុង `/pdr/Final/`
Complete agreement documents are located in `/pdr/Final/`

### ប្រភេទទាំង ៥ (All 5 Types):

1. **កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាង គបស និង គបក**
   - Performance Agreement between PMU and PCU
   - 📄 File: `1_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាង_គបស_និង_គបក_3_october.docx`

2. **កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធាន គបក និងប្រធានគម្រោង**
   - Performance Agreement between PCU Chief and Project Manager
   - 📄 File: `2_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធានគ_ប_ក_និងប្រធានគម្រោង.docx`

3. **កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធានគម្រោង និងមន្រ្តីគម្រោងតាមតំបន់**
   - Performance Agreement between Project Manager and Regional Officers
   - 📄 File: `3_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងប្រធានគម្រោង_និងមន្រ្តីគម្រោង.docx`

4. **កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម និងការិយាល័យអប់រំក្រុងស្រុកខណ្ឌ**
   - Performance Agreement between Primary Department and District Education Office
   - 📄 File: `4_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម_និងការិយាល័យអប់រំក្រុង.docx`

5. **កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម និងសាលាបឋមសិក្សា**
   - Performance Agreement between Primary Department and Primary School
   - 📄 File: `5_កិច្ចព្រមព្រៀងសមិទ្ធកម្មរវាងនាយកដ្ឋានបឋម_និងសាលាបឋមសិក្សា.docx`

**📖 សម្រាប់ព័ត៌មានលម្អិត:** សូមមើល `/docs/CONTRACTS_OVERVIEW.md`
**📖 For detailed information:** See `/docs/CONTRACTS_OVERVIEW.md`

## រចនាសម្ព័ន្ធគម្រោង

```
plp-contract-agreement/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── contracts/         # Contracts listing page
│   ├── me-dashboard/      # M&E Dashboard
│   ├── admin/             # Admin pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ContractForm.tsx   # Contract creation form
│   ├── ContractPreview.tsx # Contract preview
│   └── SignaturePad.tsx   # Digital signature component
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Authentication utilities
│   ├── project-deliverables.ts # Project timelines
│   └── contract-indicators.ts  # Contract indicators
├── prisma/               # Database schema
│   ├── schema.prisma     # Database schema
│   ├── seed.ts          # Seed data
│   └── seed-me.ts       # M&E data seeding
├── types/                # TypeScript types
│   └── contract.ts      # Contract types
├── docs/                 # Documentation
│   ├── CONTRACTS_OVERVIEW.md     # Complete contracts guide
│   ├── IMPLEMENTATION_SUMMARY.md # Technical summary
│   ├── DEMO_USERS.md            # Demo users guide
│   └── API_ERROR_RESPONSES.md   # API documentation
└── pdr/                 # Original contract documents
    ├── Final/           # Final PDR documents (5 agreements)
    └── docx/           # DOCX templates

```

## Scripts

- `npm run dev` - ដំណើរការ development server
- `npm run build` - Build សម្រាប់ production
- `npm run start` - ដំណើរការ production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - បើក Prisma Studio សម្រាប់មើល database
- `npm run prisma:seed` - Seed database with initial data

## Deployment

សម្រាប់ deploy ទៅ Vercel:

1. Push កូដទៅ GitHub
2. Import គម្រោងទៅក្នុង Vercel
3. កំណត់ environment variables
4. Deploy

## 📚 ឯកសារបន្ថែម (Additional Documentation)

សម្រាប់ព័ត៌មានលម្អិត សូមមើល `/docs/` directory:

- **📋 [CONTRACTS_OVERVIEW.md](./docs/CONTRACTS_OVERVIEW.md)** - ព័ត៌មានពេញលេញអំពីកិច្ចព្រមព្រៀងទាំង ៥
- **🚀 [IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md)** - ព័ត៌មានបច្ចេកទេស
- **👥 [DEMO_USERS.md](./docs/DEMO_USERS.md)** - គណនីសាកល្បង
- **⚠️ [API_ERROR_RESPONSES.md](./docs/API_ERROR_RESPONSES.md)** - ឯកសារ API
- **📚 [docs/README.md](./docs/README.md)** - ដំណើរការឯកសារ

For detailed information, see the `/docs/` directory:
- Complete contracts guide
- Technical implementation details
- Demo users and testing guide
- API documentation
- Documentation index

---

## License

MIT