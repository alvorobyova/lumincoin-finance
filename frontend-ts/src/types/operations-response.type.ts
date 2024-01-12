export type OperationCommon = {
  amount: number;
  category: string;
  comment: string;
  date: string;
  type: string;
};

export type OperationResponseType = OperationCommon;

export type OperationsResponseType = {
  id: number;
} & OperationCommon;

export type FormDataType = {
  category_id: number;
} & OperationCommon;
