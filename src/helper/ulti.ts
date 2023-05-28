import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { ERROR_CODE } from '../app/constants/error.cons';

export const UResult = <T, L>(
  result: T,
  messages,
  payload: L,
  metadata = {},
  debug = null,
) => {
  return {
    result: result,
    messages: messages,
    metadata,
    payload: payload,
  };
};

export const ULog = (errCode: ERROR_CODE, options, messages) => {
  if (options?.save && process.env?.MODE == 'PRODUCTION') {
    // Save log file by date
  }
  if (options?.tracking && process.env?.MODE != 'PRODUCTION') {
    if (errCode) console.log(`|-- ULog${errCode ? ' #' + errCode : ''} : `);
    messages.forEach((massage) => {
      console.log(`|---- ULog:` + massage);
    });
  }
};

export const UThrowError = (
  error,
  errType: ERROR_CODE,
  errCode: ERROR_CODE = null,
) => {
  let err = error.messages
    ? error.messages
    : error.message
    ? error?.message
    : '';

  if (errCode) {
    err = errCode;
  }

  if (errType == ERROR_CODE.BAD_GATEWAY) {
    throw new BadGatewayException(err);
  } else if (errType == ERROR_CODE.BAD_REQUEST) {
    throw new BadRequestException(err);
  }
};
