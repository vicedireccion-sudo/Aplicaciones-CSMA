
export interface Candidate {
  id: string;
  name: string;
  votes: number;
}

export interface Voter {
  email: string;
  hasVoted: boolean;
}
