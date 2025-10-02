import { whatsAppClientService } from './WhatsAppClientService';
import { Validators, Formatters } from '../utils';
import { logger } from '../config';
import { IContactResponse, IValidateNumberDTO, INumberValidationResponse, ISaveContactDTO } from '../models';

export class ContactService {
  async getAllContacts(sessionId: string): Promise<IContactResponse[]> {
    const client = whatsAppClientService.getClient(sessionId);
    const contacts = await client.getContacts();
    return contacts.map((contact) => Formatters.formatContact(contact));
  }

  async getContactById(sessionId: string, contactId: string): Promise<IContactResponse> {
    Validators.validateChatId(contactId);
    const client = whatsAppClientService.getClient(sessionId);
    const contact = await client.getContactById(contactId);
    return Formatters.formatContact(contact);
  }

  async getProfilePicUrl(sessionId: string, contactId: string): Promise<string | undefined> {
    Validators.validateChatId(contactId);
    const client = whatsAppClientService.getClient(sessionId);
    const contact = await client.getContactById(contactId);
    return await contact.getProfilePicUrl();
  }

  async getAbout(sessionId: string, contactId: string): Promise<string | undefined> {
    Validators.validateChatId(contactId);
    const client = whatsAppClientService.getClient(sessionId);
    const contact = await client.getContactById(contactId);
    const about = await contact.getAbout();
    return about ?? undefined;
  }

  async getCommonGroups(sessionId: string, contactId: string): Promise<any[]> {
    Validators.validateChatId(contactId);
    const client = whatsAppClientService.getClient(sessionId);
    const contact = await client.getContactById(contactId);
    return await contact.getCommonGroups();
  }

  async blockContact(sessionId: string, contactId: string): Promise<void> {
    Validators.validateChatId(contactId);
    const client = whatsAppClientService.getClient(sessionId);
    const contact = await client.getContactById(contactId);
    await contact.block();
    logger.info(`Contact ${contactId} blocked`);
  }

  async unblockContact(sessionId: string, contactId: string): Promise<void> {
    Validators.validateChatId(contactId);
    const client = whatsAppClientService.getClient(sessionId);
    const contact = await client.getContactById(contactId);
    await contact.unblock();
    logger.info(`Contact ${contactId} unblocked`);
  }

  async validateNumber(sessionId: string, data: IValidateNumberDTO): Promise<INumberValidationResponse> {
    Validators.validatePhoneNumber(data.number);
    const client = whatsAppClientService.getClient(sessionId);
    const numberId = await client.getNumberId(data.number);

    if (numberId) {
      return { exists: true, jid: numberId._serialized };
    }

    return { exists: false };
  }

  async getBlockedContacts(sessionId: string): Promise<IContactResponse[]> {
    const client = whatsAppClientService.getClient(sessionId);
    const blocked = await client.getBlockedContacts();
    return blocked.map((contact) => Formatters.formatContact(contact));
  }

  async saveContact(sessionId: string, data: ISaveContactDTO): Promise<void> {
    Validators.validatePhoneNumber(data.phoneNumber);
    const client = whatsAppClientService.getClient(sessionId);
    await client.saveOrEditAddressbookContact(data.phoneNumber, data.firstName, data.lastName || '', data.syncToAddressbook);
    logger.info(`Contact saved: ${data.phoneNumber}`);
  }
}

export const contactService = new ContactService();
