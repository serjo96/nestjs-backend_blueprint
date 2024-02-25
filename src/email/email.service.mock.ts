
export class EmailServiceMock {
  findAll(where: any): any[] {
    return [];
  }

  findOne(where: any): any {
    return {
      id: 1,
      email: 'test@admin.com',
    };
  }

  create({ email }: { email: string }): any {
    return {
      id: '123',
      timestamp: new Date(),
      emailToken: 'some token',
      email: 'testUser@ya.ru',
      createdAt: new Date(),
      deletedAt: null,
      updatedAt: null,
    };
  }

  // save(emailDto) {
  //   const email: Partial<EmailVerificationEntity> = {
  //     id: '123',
  //     timestamp: new Date(),
  //     emailToken: 'some token',
  //     email: 'testUser@ya.ru',
  //     createdAt: new Date(),
  //     deletedAt: null,
  //     updatedAt: null,
  //   };
  //
  //   return email;
  // }
}
