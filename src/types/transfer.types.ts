export interface ITransferTransaction {
  transactionId: string;
  id: number;
  citizenName: string;
  citizenEmail: string;
  documents: Record<
    string,
    {
      state: 'pending' | 'success' | 'error';
      url: string;
    }
  >;
  confirmationURL: string;
  createdAt: number;
  updatedAt: number;
}

export interface TTransferCitizen  {
  id: number,
  citizenName: string,
  citizenEmail: string,
  Documents: Record<string, Array<string>>,
  confirmationURL: string,
};
