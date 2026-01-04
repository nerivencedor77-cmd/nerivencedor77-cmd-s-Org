
export type SourceType = 'camera' | 'screen' | 'image' | 'color' | 'ai';

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  stream?: MediaStream;
  thumbnail?: string;
  color?: string;
  imageUrl?: string;
}

export interface BroadcastState {
  previewSourceId: string | null;
  liveSourceId: string | null;
  isStreaming: boolean;
  isRecording: boolean;
}

export enum LayerId {
  Layer1 = 'Layer 1 (Overlays)',
  Layer2 = 'Layer 2 (Main)',
  Layer3 = 'Layer 3 (Graphics)',
  Layer4 = 'Layer 4 (Background)',
  Layer5 = 'Layer 5 (Audio Only)'
}
