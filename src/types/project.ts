
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
}

export interface ProjectState {
  fps: number;
  tracks: any[];
  duration: number;
}
