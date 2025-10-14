import { ApiResponse, ErrorCodes } from '@epayco/shared';

export function successResponse<T>(message: string, data?: T): ApiResponse<T> {
  const response: ApiResponse<T> = {
    code: ErrorCodes.OK,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return response;
}
