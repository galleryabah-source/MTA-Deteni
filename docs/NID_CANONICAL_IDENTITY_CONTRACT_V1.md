# NID — Canonical Deteni Identity Contract v1.0

Status: **HARD INVARIANT**

## 1. Purpose
Nomor Induk Deteni (NID) adalah **single number identity** untuk satu Deteni di MTA DETENI.

NID digunakan secara lintas-seksi oleh:
- RAP
- Perkes
- Kamtib

Tidak boleh ada nomor identitas Deteni alternatif yang dibuat oleh masing-masing seksi.

## 2. Canonical Format
```text
RDM-PTK-YY-NNNNNN
```

Contoh:
```text
RDM-PTK-26-000001
```

| Komponen | Arti | Aturan |
|---|---|---|
| RDM | Rudenim | Fixed |
| PTK | Pontianak | Fixed untuk unit ini |
| YY | Tahun masuk | 2 digit tahun |
| NNNNNN | Nomor urut | 6 digit, system-generated |

## 3. Hard Invariants
1. Setiap Deteni memiliki tepat satu NID canonical.
2. NID dihasilkan otomatis oleh sistem.
3. Operator tidak memasukkan NID secara manual.
4. NID tidak dapat diedit setelah diterbitkan.
5. NID tidak dapat diganti melalui UI.
6. NID tidak dapat diganti melalui API mutation.
7. NID wajib unique.
8. NID wajib non-null.
9. Generator sequence harus atomic terhadap concurrent request.
10. NID yang pernah diterbitkan tidak boleh digunakan kembali.
11. NID harus dilindungi oleh database constraint.
12. NID harus dilindungi oleh application/domain boundary.
13. Attempt perubahan NID harus ditolak dan dapat diaudit.
14. RAP, Perkes, dan Kamtib menggunakan identity Deteni yang sama.
15. Tidak boleh ada identity generator kedua untuk Deteni.

## 4. Technical Identity vs Operational Identity
MTA DETENI boleh menggunakan UUID sebagai technical primary key internal.

```text
technical primary key != canonical operational identity
```

Contoh:
```text
internal id : UUID
NID          : RDM-PTK-26-000001
```

## 5. Generation Boundary
```text
CREATE DETENI
      |
      v
Identity Service / Domain Boundary
      |
      +-- unit      = RDM
      +-- office    = PTK
      +-- entryYear = YY
      +-- sequence  = atomic
      |
      v
RDM-PTK-26-000001
      |
      v
IMMUTABLE
```

NID tidak boleh dibuat dengan pola `MAX(sequence) + 1` karena tidak aman terhadap concurrent request.

## 6. API Contract
Create Deteni: `POST /detainees`.

Request tidak boleh menjadikan `nid` sebagai user-controlled field.

Response menghasilkan NID dari sistem.

Update Deteni tidak boleh menerima perubahan NID. `nid` adalah immutable field.

## 7. Validation
Canonical pattern:
```regex
^RDM-PTK-[0-9]{2}-[0-9]{6}$
```

Regex hanya validation layer. Uniqueness, sequence allocation, dan immutability harus dijamin oleh database/application transaction boundary.

## 8. Cross-Section Identity
```text
                    DETENI
                       |
                       v
             RDM-PTK-26-000001
                       |
       +---------------+---------------+
       |               |               |
       v               v               v
      RAP            PERKES          KAMTIB
       |               |               |
       +---------------+---------------+
                       |
                       v
              SHARED IDENTITY
```

RAP, Perkes, dan Kamtib tidak membuat nomor Deteni sendiri.

## 9. Database Requirements
Minimal:
```text
nid NOT NULL
UNIQUE(nid)
```

Schema Deteni harus memisahkan `id` sebagai technical primary key dan `nid` sebagai canonical operational identity.

Sequence/generator harus aman terhadap concurrent creation.

Tidak ada migration Deteni sebelum kontrak ini disetujui dan expected-vs-actual schema reconciliation selesai.

## 10. Security and Audit
Attempt untuk mengubah NID setelah penerbitan harus ditolak.
Peristiwa material terkait identity harus dapat dikorelasikan dengan audit evidence.
Tidak boleh ada endpoint administratif yang menyediakan perubahan bebas terhadap NID.

## 11. Required Negative Tests
```text
NID-TEST-001 manual NID on create          -> DENY
NID-TEST-002 NID update                    -> DENY
NID-TEST-003 duplicate NID                -> DENY
NID-TEST-004 malformed NID                -> DENY
NID-TEST-005 concurrent generation        -> UNIQUE
NID-TEST-006 sequence collision           -> SAFE
NID-TEST-007 NID reuse                    -> DENY
NID-TEST-008 direct API NID mutation      -> DENY
NID-TEST-009 cross-section identity split -> DENY
NID-TEST-010 second identity generator    -> DENY
```

Target: **10/10 PASS** sebelum Deteni schema/migration dinyatakan siap.

## 12. Migration Gate
```text
NID HARD INVARIANT
        |
        v
Identity Contract
        |
        v
Expected Schema
        |
        v
Actual Schema Reconciliation
        |
        v
Database Design
        |
        v
Generator / Sequence
        |
        v
Constraints
        |
        v
Repository / Identity Service
        |
        v
API Contract
        |
        v
Authorization
        |
        v
Audit
        |
        v
Negative Tests
        |
        v
Migration Gate
        |
        v
DETENI IMPLEMENTATION
```

**Migration tidak boleh mendahului contract gate.**

## 13. Canonical Rule
> **One Detainee → One Canonical Identity → One NID → RAP + Perkes + Kamtib**

> **NID adalah immutable canonical operational identity, bukan field administratif yang dapat diedit.**

## 14. Implementation Status
- [x] NID format defined
- [x] NID hard invariant defined
- [x] System-generated rule defined
- [x] Immutable rule defined
- [x] Cross-section identity rule defined
- [x] Technical UUID vs operational NID boundary defined
- [x] Migration prerequisite defined
- [ ] Database schema reconciliation
- [ ] Atomic sequence implementation
- [ ] Identity service/repository implementation
- [ ] API enforcement
- [ ] Database constraints
- [ ] Negative test suite
- [ ] CI gate
- [ ] Deteni migration approval