export interface ISetProfileNameDTO {
  displayName: string;
}

export interface ISetProfileStatusDTO {
  status: string;
}

export interface ISetProfilePictureDTO {
  media: {
    mimetype: string;
    data: string; // base64
  };
}

export interface IDeleteProfilePictureDTO {
  // Sem parâmetros necessários
}

export interface IGetMyProfileDTO {
  // Sem parâmetros necessários
}

export interface IProfileResponse {
  me: string;
  phone: string;
  platform: string;
  pushname: string;
  wid: string;
}

export interface IBatteryStatusResponse {
  battery: number;
  plugged: boolean;
}

export interface ISetAutoDownloadDTO {
  type: 'audio' | 'documents' | 'photos' | 'videos';
  enabled: boolean;
}

export interface ISetBackgroundSyncDTO {
  enabled: boolean;
}

export interface IGetStateResponse {
  state: string;
}
