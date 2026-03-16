export const TUTOR_TAG_OPTIONS = [
  { id: "merit-scholarship", label: "Merit scholarship" },
  { id: "need-based-scholarship", label: "Need-based scholarship" },
  { id: "full-ride", label: "Full-ride" },
  { id: "full-tuition", label: "Full tuition" },
  { id: "essay-expertise", label: "Essay expertise" },
  { id: "test-optional", label: "Test-optional" },
  { id: "10-plus-ap-classes", label: "10+ AP Classes" },
  { id: "under-10-ap-classes", label: "<10 AP Classes" },
  { id: "community-service", label: "Community Service" },
  { id: "internships", label: "Internships" },
  { id: "non-profit-founder", label: "Non-profit founder" },
  { id: "startup-founder", label: "Startup founder" },
  { id: "summer-programs", label: "Summer programs" },
  { id: "rsi", label: "RSI" },
  { id: "yygs", label: "YYGS" },
  { id: "t5-acceptances", label: "T5 Acceptances" },
  { id: "t10-acceptances", label: "T10 Acceptances" },
  { id: "t20-acceptances", label: "T20 Acceptances" },
  { id: "t30-acceptances", label: "T30 Acceptances" },
  { id: "minority", label: "Minority" },
  { id: "fgli", label: "FGLI" },
  { id: "uwc", label: "UWC" },
  { id: "competitive-major", label: "Competitive major" },
  { id: "prestigious-award-recipient", label: "Prestigious award recipient" },
  { id: "isef", label: "ISEF" },
  { id: "international-olympiad", label: "International Olympiad" },
  { id: "international-competition", label: "International Competition" }
] as const;

export const MEDAL_RANKS = ["bronze", "silver", "gold", "platinum"] as const;

export const MEDAL_SUBJECTS = [
  { id: "mathematics-usamo-usajmo", label: "Mathematics (USAMO/USAJMO)" },
  { id: "computing-usaco", label: "Computing (USACO)" },
  { id: "physics-usapho", label: "Physics (USAPhO)" },
  { id: "chemistry-usnco", label: "Chemistry (USNCO)" },
  { id: "biology-usabo", label: "Biology (USABO)" }
] as const;

const staticTagSet = new Set<string>(TUTOR_TAG_OPTIONS.map((option) => option.id));
const medalSubjectSet = new Set<string>(MEDAL_SUBJECTS.map((subject) => subject.id));
const medalRankSet = new Set<string>(MEDAL_RANKS);

export function isAllowedTutorTag(tag: string) {
  if (staticTagSet.has(tag)) {
    return true;
  }

  if (/^sat-(\d{3,4})\/1600$/.test(tag)) {
    const score = Number(tag.match(/^sat-(\d{3,4})\/1600$/)?.[1]);
    return Number.isInteger(score) && score >= 400 && score <= 1600;
  }

  if (/^ib-(\d{1,2})\/45$/.test(tag)) {
    const score = Number(tag.match(/^ib-(\d{1,2})\/45$/)?.[1]);
    return Number.isInteger(score) && score >= 1 && score <= 45;
  }

  if (/^gpa-(\d)\/4\.0$/.test(tag)) {
    const score = Number(tag.match(/^gpa-(\d)\/4\.0$/)?.[1]);
    return Number.isInteger(score) && score >= 1 && score <= 4;
  }

  const medalMatch = tag.match(/^medal-([a-z0-9-]+)-(bronze|silver|gold|platinum)$/);
  if (!medalMatch) {
    return false;
  }

  return medalSubjectSet.has(medalMatch[1]) && medalRankSet.has(medalMatch[2] as (typeof MEDAL_RANKS)[number]);
}
