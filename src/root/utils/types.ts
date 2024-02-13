export type RequestBodyType = {
  eventType: "runAction" | "clientRequestsUpdate";
  action?: string;
  data?: string | {};
};
