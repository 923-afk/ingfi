export type VerificationLevel = "pending" | "basic" | "enhanced";

export interface Professional {
  id: string;
  name: string;
  trade: string;
  yearsOfExperience: number;
  rating: number;
  completedJobs: number;
  certifications: string[];
  serviceAreas: string[];
  availability: string;
  introduction: string;
  verificationLevel: VerificationLevel;
  verifiedAt?: string;
  verificationNotes?: string;
}

