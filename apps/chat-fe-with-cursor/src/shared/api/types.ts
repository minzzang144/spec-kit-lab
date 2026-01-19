/** contracts/openapi.yaml, socket-events.md 기준 */

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderNickname: string;
  text: string;
  createdAt: string;
}
