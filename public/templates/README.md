# Contract Document Templates

## Template Files

Place your DOCX template files here:

- `contract_template_4.docx` - For education offices (district/city/khan)
- `contract_template_5.docx` - For primary schools

## Template Placeholders

Use these placeholders in your DOCX templates. They will be replaced with actual data when generating documents:

### Header
- `{country_km}` - ព្រះរាជាណាចក្រកម្ពុជា
- `{motto_km}` - ជាតិ សាសនា ព្រះមហាក្សត្រ
- `{ministry_km}` - ក្រសួងអប់រំ យុវជន និងកីឡា
- `{department_km}` - នាយកដ្ឋានបឋមសិក្សា

### Contract Information
- `{contract_number}` - Contract number (e.g., 001/2025)
- `{academic_year}` - Academic year (e.g., 2025-2026)

### Party A (Department)
- `{party_a_name}` - នាយកដ្ឋានបឋមសិក្សា
- `{party_a_position}` - ប្រធាននាយកដ្ឋានបឋមសិក្សា
- `{party_a_representative}` - លោកបណ្ឌិត កាន់ ពុទ្ធី

### Party B (Partner)
- `{party_b_name}` - Partner name
- `{party_b_position}` - Partner position
- `{party_b_representative}` - Partner representative name
- `{party_b_location}` - Partner location

### Indicators Table (Loop)

Use a table with this loop structure:

```
{#indicators}
{indicator_number} | {indicator_name_km} | {baseline_percentage}% → {target_percentage}% | {implementation_period}
{calculation_rule_km}
{/indicators}
```

### Budget and Incentives
- `{total_budget}` - Total budget amount
- `{disbursement_count}` - Number of disbursements (default: 4)
- `{bank_account_name}` - Bank account holder name
- `{bank_account_number}` - Bank account number

### Signatures
- `{signature_date}` - Signature date
- `{current_date}` - Current date

## How to Use

1. Create your DOCX template with the placeholders above
2. Save as `contract_template_4.docx` or `contract_template_5.docx`
3. Place in this directory
4. The system will automatically use these templates when generating contract documents

## Example API Usage

```bash
# Generate and download contract document
GET /api/contracts/{id}/generate-document
```

This will automatically:
1. Fetch contract data from database
2. Select appropriate template (4 or 5)
3. Replace all placeholders with actual data
4. Generate DOCX file
5. Return as downloadable file

## Font Support

Make sure your template uses Khmer-compatible fonts like:
- Khmer OS System
- Khmer OS Battambang
- Google Hanuman (included in project)

## Troubleshooting

If document generation fails:
1. Check that template files exist in this directory
2. Verify all placeholder syntax is correct
3. Ensure template uses supported fonts
4. Check server logs for detailed error messages
