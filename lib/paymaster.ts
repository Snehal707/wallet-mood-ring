import { type UserOperationRequest } from 'viem';

export interface PaymasterConfig {
  url: string;
  policyId?: string;
}

export async function sponsorUserOperation(
  userOp: UserOperationRequest,
  config: PaymasterConfig
): Promise<UserOperationRequest> {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'pm_sponsorUserOperation',
      params: [
        userOp,
        {
          ...(config.policyId && { policyId: config.policyId }),
        },
      ],
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Paymaster error: ${data.error.message}`);
  }

  return {
    ...userOp,
    paymaster: data.result.paymaster,
    paymasterData: data.result.paymasterData,
    paymasterVerificationGasLimit: data.result.paymasterVerificationGasLimit,
    paymasterPostOpGasLimit: data.result.paymasterPostOpGasLimit,
  };
}
