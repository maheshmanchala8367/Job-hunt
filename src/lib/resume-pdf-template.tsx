import React from 'react';
import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ResumeContact {
  location?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}
export interface ResumeSkillSection { category: string; items: string[] }
export interface ResumeExperience {
  company: string; title: string; location: string;
  startDate: string; endDate: string; bullets: string[];
}
export interface ResumeEducation {
  institution: string; degree: string; location?: string;
  startDate: string; endDate: string; gpa?: string;
}
export interface ResumeProject {
  name: string; technologies?: string[]; bullets: string[];
}
export interface ResumeCertification {
  name: string; issuer?: string; date?: string;
}
export interface ResumeData {
  name: string;
  contact: ResumeContact;
  summary?: string;
  skills?: ResumeSkillSection[];
  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
}

// ── Styles matching the attached resume template ───────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 50,
    color: '#000',
    backgroundColor: '#fff',
    lineHeight: 1.25,
  },
  // Header
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  contactLine: {
    fontSize: 8.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  // Section header — bold uppercase + full-width underline (matches resume)
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    borderBottomWidth: 0.8,
    borderBottomColor: '#000',
    paddingBottom: 1,
    marginTop: 9,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  // Entry block
  entryBlock: { marginBottom: 5 },
  // Two-column row: company/institution left, date right
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  company: { fontFamily: 'Helvetica-Bold', fontSize: 9.5 },
  date: { fontSize: 9, textAlign: 'right', flexShrink: 0 },
  jobTitle: { fontFamily: 'Helvetica-Oblique', fontSize: 9 },
  jobLocation: { fontFamily: 'Helvetica-Oblique', fontSize: 9, textAlign: 'right', flexShrink: 0 },
  // Bullet
  bulletRow: { flexDirection: 'row', marginLeft: 10, marginTop: 2 },
  bulletDot: { fontSize: 9, width: 9 },
  bulletText: { fontSize: 9, flex: 1, lineHeight: 1.35 },
  // Skills
  skillRow: { flexDirection: 'row', marginBottom: 2.5, flexWrap: 'wrap' },
  skillCategory: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  skillItems: { fontSize: 9, flex: 1 },
  // Summary
  summaryText: { fontSize: 9, lineHeight: 1.4, marginTop: 2 },
  // Project name
  projectName: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, marginBottom: 1 },
  techText: { fontFamily: 'Helvetica-Oblique', fontSize: 8.5, marginBottom: 1 },
});

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={S.sectionHeader}>{title}</Text>;
}

function Bullet({ text }: { text: string }) {
  const clean = text.replace(/^[•\-–]\s*/, '');
  return (
    <View style={S.bulletRow}>
      <Text style={S.bulletDot}>•</Text>
      <Text style={S.bulletText}>{clean}</Text>
    </View>
  );
}

// ── Main PDF Document ──────────────────────────────────────────────────────────

export function ResumePDFDocument({ data }: { data: ResumeData }) {
  const contactParts = [
    data.contact?.location,
    data.contact?.phone,
    data.contact?.email,
    data.contact?.linkedin,
    data.contact?.github,
    data.contact?.website,
  ].filter(Boolean) as string[];

  return (
    <Document>
      <Page size="LETTER" style={S.page}>

        {/* ── Name + Contact ── */}
        <Text style={S.name}>{data.name}</Text>
        <Text style={S.contactLine}>{contactParts.join(' | ')}</Text>

        {/* ── Summary ── */}
        {data.summary && (
          <>
            <SectionHeader title="SUMMARY" />
            <Text style={S.summaryText}>{data.summary}</Text>
          </>
        )}

        {/* ── Technical Skills ── */}
        {data.skills && data.skills.length > 0 && (
          <>
            <SectionHeader title="TECHNICAL SKILLS" />
            {data.skills.map((s, i) => (
              <View key={i} style={S.skillRow}>
                <Text style={S.skillCategory}>• {s.category}: </Text>
                <Text style={S.skillItems}>{s.items.join(', ')}</Text>
              </View>
            ))}
          </>
        )}

        {/* ── Experience ── */}
        {data.experience && data.experience.length > 0 && (
          <>
            <SectionHeader title="EXPERIENCE" />
            {data.experience.map((exp, i) => (
              <View key={i} style={S.entryBlock}>
                <View style={S.rowSpaceBetween}>
                  <Text style={S.company}>{exp.company}</Text>
                  <Text style={S.date}>{exp.startDate} - {exp.endDate}</Text>
                </View>
                <View style={S.rowSpaceBetween}>
                  <Text style={S.jobTitle}>{exp.title}</Text>
                  <Text style={S.jobLocation}>{exp.location}</Text>
                </View>
                {(exp.bullets ?? []).map((b, j) => <Bullet key={j} text={b} />)}
              </View>
            ))}
          </>
        )}

        {/* ── Education ── */}
        {data.education && data.education.length > 0 && (
          <>
            <SectionHeader title="EDUCATION" />
            {data.education.map((edu, i) => (
              <View key={i} style={S.entryBlock}>
                <View style={S.rowSpaceBetween}>
                  <Text style={S.company}>{edu.institution}</Text>
                  <Text style={S.date}>{edu.startDate} - {edu.endDate}</Text>
                </View>
                <Text style={S.jobTitle}>
                  {edu.degree}{edu.gpa ? `  |  GPA: ${edu.gpa}` : ''}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* ── Projects ── */}
        {data.projects && data.projects.length > 0 && (
          <>
            <SectionHeader title="PROJECTS" />
            {data.projects.map((proj, i) => (
              <View key={i} style={S.entryBlock}>
                <Text style={S.projectName}>{proj.name}</Text>
                {proj.technologies && proj.technologies.length > 0 && (
                  <Text style={S.techText}>Technologies: {proj.technologies.join(', ')}</Text>
                )}
                {(proj.bullets ?? []).map((b, j) => <Bullet key={j} text={b} />)}
              </View>
            ))}
          </>
        )}

        {/* ── Certifications ── */}
        {data.certifications && data.certifications.length > 0 && (
          <>
            <SectionHeader title="CERTIFICATIONS" />
            {data.certifications.map((cert, i) => (
              <View key={i} style={S.entryBlock}>
                <View style={S.rowSpaceBetween}>
                  <Text style={S.company}>{cert.name}</Text>
                  {cert.date && <Text style={S.date}>{cert.date}</Text>}
                </View>
                {cert.issuer && <Text style={S.jobTitle}>{cert.issuer}</Text>}
              </View>
            ))}
          </>
        )}

      </Page>
    </Document>
  );
}
