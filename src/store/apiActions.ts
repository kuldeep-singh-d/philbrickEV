import { createAction } from '@reduxjs/toolkit';

interface Props {
  url?: string;
  data?: object;
  method?: string;
  token?: boolean;
  onStart?: string;
  onReset?: string;
  sample?: boolean;
  onFailed?: string;
  onChange?: string;
  isLogin?: boolean;
  captcha?: boolean;
  fileName?: string;
  onSuccess?: string;
  formData?: boolean;
  resource?: boolean;
  onFileStart?: string;
  onFileReset?: string;
  onFileFailed?: string;
  onFileSuccess?: string;
  isRowData?: boolean;
  headers?: Record<string, string>;
}

// root action creators
export const apiCallBegan = createAction<Props>('api/callBegan');
export const apiCallFailed = createAction<Props>('api/callFailed');
export const apiCallSuccess = createAction<Props>('api/callSuccess');

// root action creators
export const apiFileCallBegan = createAction<Props>('apiFile/callBegan');
export const apiFileCallFailed = createAction<Props>('apiFile/callFailed');
export const apiFileCallSuccess = createAction<Props>('apiFile/callSuccess');
