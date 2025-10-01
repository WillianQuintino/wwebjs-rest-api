export interface ICreateGroupDTO {
  name: string;
  participantIds: string[];
}

export interface IAddParticipantsDTO {
  groupId: string;
  participantIds: string[];
}

export interface IRemoveParticipantsDTO {
  groupId: string;
  participantIds: string[];
}

export interface IPromoteParticipantsDTO {
  groupId: string;
  participantIds: string[];
}

export interface IDemoteParticipantsDTO {
  groupId: string;
  participantIds: string[];
}

export interface IUpdateGroupSubjectDTO {
  groupId: string;
  subject: string;
}

export interface IUpdateGroupDescriptionDTO {
  groupId: string;
  description: string;
}

export interface IUpdateGroupPictureDTO {
  groupId: string;
  media: {
    mimetype: string;
    data: string; // base64
  };
}

export interface IDeleteGroupPictureDTO {
  groupId: string;
}

export interface ILeaveGroupDTO {
  groupId: string;
}

export interface IGetInviteCodeDTO {
  groupId: string;
}

export interface IRevokeInviteDTO {
  groupId: string;
}

export interface IAcceptInviteDTO {
  inviteCode: string;
}

export interface ISetGroupSettingDTO {
  groupId: string;
  setting: 'announcement' | 'locked' | 'unlocked';
}

export interface ISetMessagesAdminsOnlyDTO {
  groupId: string;
  adminsOnly: boolean;
}

export interface ISetInfoAdminsOnlyDTO {
  groupId: string;
  adminsOnly: boolean;
}

export interface ISetAddMembersAdminsOnlyDTO {
  groupId: string;
  adminsOnly: boolean;
}

export interface IGroupMembershipRequest {
  id: string;
  author: string;
  timestamp: number;
}

export interface IGetGroupMembershipRequestsDTO {
  groupId: string;
}

export interface IApproveGroupMembershipRequestDTO {
  groupId: string;
  participantIds: string[];
  sleep?: number;
}

export interface IRejectGroupMembershipRequestDTO {
  groupId: string;
  participantIds: string[];
  sleep?: number;
}
