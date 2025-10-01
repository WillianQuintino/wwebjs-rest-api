export interface IContactResponse {
  id: string;
  name?: string;
  pushname?: string;
  shortName?: string;
  number: string;
  isBusiness: boolean;
  isEnterprise: boolean;
  isGroup: boolean;
  isMe: boolean;
  isMyContact: boolean;
  isUser: boolean;
  isWAContact: boolean;
  isBlocked: boolean;
}

export interface IBusinessContactResponse extends IContactResponse {
  businessProfile?: {
    description?: string;
    category?: string;
    email?: string;
    website?: string;
    address?: string;
  };
}

export interface IGetContactDTO {
  contactId: string;
}

export interface IBlockContactDTO {
  contactId: string;
  block: boolean;
}

export interface IGetContactAboutDTO {
  contactId: string;
}

export interface IGetProfilePicDTO {
  contactId: string;
}

export interface IGetCommonGroupsDTO {
  contactId: string;
}

export interface IValidateNumberDTO {
  number: string;
}

export interface INumberValidationResponse {
  exists: boolean;
  jid?: string;
}

export interface ISaveContactDTO {
  phoneNumber: string;
  firstName: string;
  lastName?: string;
  syncToAddressbook?: boolean;
}

export interface IDeleteContactDTO {
  phoneNumber: string;
}
