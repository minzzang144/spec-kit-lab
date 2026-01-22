/**
 * 채팅방 자동 이름 생성 유틸리티
 *
 * 채팅방 이름을 "채팅방 #XXX" 형태로 자동 생성합니다.
 * 번호는 3자리 패딩으로 표시됩니다 (001, 002, ..., 999).
 */

export class RoomNameGenerator {
  private static readonly PREFIX = '채팅방 #';
  private static readonly MAX_ROOM_NUMBER = 999;
  private static readonly MIN_ROOM_NUMBER = 1;

  /**
   * 방 번호로부터 방 이름을 생성합니다.
   * @param roomNumber 방 번호 (1~999)
   * @returns 생성된 방 이름 (예: "채팅방 #001")
   * @throws Error 방 번호가 유효하지 않은 경우
   */
  static generateRoomName(roomNumber: number): string {
    if (!Number.isInteger(roomNumber)) {
      throw new Error('방 번호는 정수여야 합니다.');
    }

    if (roomNumber < this.MIN_ROOM_NUMBER || roomNumber > this.MAX_ROOM_NUMBER) {
      throw new Error(
        `방 번호는 ${this.MIN_ROOM_NUMBER}부터 ${this.MAX_ROOM_NUMBER}까지만 지원됩니다.`
      );
    }

    // 3자리 패딩으로 번호를 포매팅 (001, 002, ...)
    const paddedNumber = roomNumber.toString().padStart(3, '0');
    return `${this.PREFIX}${paddedNumber}`;
  }

  /**
   * 방 이름에서 방 번호를 추출합니다.
   * @param roomName 방 이름 (예: "채팅방 #001")
   * @returns 추출된 방 번호, 유효하지 않으면 null
   */
  static extractRoomNumber(roomName: string): number | null {
    if (!roomName || typeof roomName !== 'string') {
      return null;
    }

    if (!roomName.startsWith(this.PREFIX)) {
      return null;
    }

    const numberPart = roomName.substring(this.PREFIX.length);

    // 3자리 숫자 형태인지 검증
    const numberPattern = /^\d{3}$/;
    if (!numberPattern.test(numberPart)) {
      return null;
    }

    const roomNumber = parseInt(numberPart, 10);

    if (roomNumber < this.MIN_ROOM_NUMBER || roomNumber > this.MAX_ROOM_NUMBER) {
      return null;
    }

    return roomNumber;
  }

  /**
   * 방 이름이 유효한 형태인지 검증합니다.
   * @param roomName 검증할 방 이름
   * @returns 유효하면 true, 아니면 false
   */
  static isValidRoomName(roomName: string): boolean {
    return this.extractRoomNumber(roomName) !== null;
  }

  /**
   * 사용 중인 방 번호 목록에서 다음으로 사용할 수 있는 방 번호를 찾습니다.
   * @param usedNumbers 사용 중인 방 번호 배열
   * @returns 다음 사용 가능한 방 번호, 모두 사용 중이면 null
   */
  static findNextAvailableNumber(usedNumbers: number[]): number | null {
    const usedSet = new Set(usedNumbers);

    for (let i = this.MIN_ROOM_NUMBER; i <= this.MAX_ROOM_NUMBER; i++) {
      if (!usedSet.has(i)) {
        return i;
      }
    }

    return null; // 모든 번호가 사용 중
  }

  /**
   * 사용 중인 방 이름 목록에서 다음으로 사용할 수 있는 방 이름을 생성합니다.
   * @param usedRoomNames 사용 중인 방 이름 배열
   * @returns 다음 사용 가능한 방 이름, 모두 사용 중이면 null
   */
  static generateNextAvailableRoomName(usedRoomNames: string[]): string | null {
    // 사용 중인 방 이름들에서 번호 추출
    const usedNumbers = usedRoomNames
      .map(name => this.extractRoomNumber(name))
      .filter((num): num is number => num !== null);

    const nextNumber = this.findNextAvailableNumber(usedNumbers);

    if (nextNumber === null) {
      return null;
    }

    return this.generateRoomName(nextNumber);
  }

  /**
   * 최대 지원 가능한 방 개수를 반환합니다.
   * @returns 최대 방 개수 (999개)
   */
  static getMaxRoomCount(): number {
    return this.MAX_ROOM_NUMBER;
  }

  /**
   * 방 번호 범위를 반환합니다.
   * @returns 최소/최대 방 번호 정보
   */
  static getRoomNumberRange(): { min: number; max: number } {
    return {
      min: this.MIN_ROOM_NUMBER,
      max: this.MAX_ROOM_NUMBER,
    };
  }
}