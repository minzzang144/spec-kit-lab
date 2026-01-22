import { RoomNameGenerator } from '../room-name-generator';

describe('RoomNameGenerator', () => {
  describe('generateRoomName', () => {
    it('should generate room name with 3-digit padding', () => {
      expect(RoomNameGenerator.generateRoomName(1)).toBe('채팅방 #001');
      expect(RoomNameGenerator.generateRoomName(42)).toBe('채팅방 #042');
      expect(RoomNameGenerator.generateRoomName(999)).toBe('채팅방 #999');
    });

    it('should throw error for invalid room numbers', () => {
      expect(() => RoomNameGenerator.generateRoomName(0)).toThrow(
        '방 번호는 1부터 999까지만 지원됩니다.',
      );
      expect(() => RoomNameGenerator.generateRoomName(1000)).toThrow(
        '방 번호는 1부터 999까지만 지원됩니다.',
      );
      expect(() => RoomNameGenerator.generateRoomName(-1)).toThrow(
        '방 번호는 1부터 999까지만 지원됩니다.',
      );
    });

    it('should throw error for non-integer room numbers', () => {
      expect(() => RoomNameGenerator.generateRoomName(1.5)).toThrow(
        '방 번호는 정수여야 합니다.',
      );
      expect(() => RoomNameGenerator.generateRoomName(NaN)).toThrow(
        '방 번호는 정수여야 합니다.',
      );
    });
  });

  describe('extractRoomNumber', () => {
    it('should extract room number from valid room names', () => {
      expect(RoomNameGenerator.extractRoomNumber('채팅방 #001')).toBe(1);
      expect(RoomNameGenerator.extractRoomNumber('채팅방 #042')).toBe(42);
      expect(RoomNameGenerator.extractRoomNumber('채팅방 #999')).toBe(999);
    });

    it('should return null for invalid room names', () => {
      expect(RoomNameGenerator.extractRoomNumber('채팅방 #1000')).toBeNull();
      expect(RoomNameGenerator.extractRoomNumber('채팅방 #000')).toBeNull();
      expect(RoomNameGenerator.extractRoomNumber('채팅방 #1')).toBeNull();
      expect(RoomNameGenerator.extractRoomNumber('채팅방 #12')).toBeNull();
      expect(RoomNameGenerator.extractRoomNumber('채팅방 #abcd')).toBeNull();
      expect(RoomNameGenerator.extractRoomNumber('잘못된 채팅방')).toBeNull();
      expect(RoomNameGenerator.extractRoomNumber('')).toBeNull();
      expect(
        RoomNameGenerator.extractRoomNumber(null as unknown as string),
      ).toBeNull();
    });
  });

  describe('isValidRoomName', () => {
    it('should validate room names correctly', () => {
      expect(RoomNameGenerator.isValidRoomName('채팅방 #001')).toBe(true);
      expect(RoomNameGenerator.isValidRoomName('채팅방 #042')).toBe(true);
      expect(RoomNameGenerator.isValidRoomName('채팅방 #999')).toBe(true);

      expect(RoomNameGenerator.isValidRoomName('채팅방 #1000')).toBe(false);
      expect(RoomNameGenerator.isValidRoomName('채팅방 #000')).toBe(false);
      expect(RoomNameGenerator.isValidRoomName('채팅방 #1')).toBe(false);
      expect(RoomNameGenerator.isValidRoomName('잘못된 채팅방')).toBe(false);
      expect(RoomNameGenerator.isValidRoomName('')).toBe(false);
    });
  });

  describe('findNextAvailableNumber', () => {
    it('should find the first available number', () => {
      expect(RoomNameGenerator.findNextAvailableNumber([])).toBe(1);
      expect(RoomNameGenerator.findNextAvailableNumber([2, 3, 4])).toBe(1);
      expect(RoomNameGenerator.findNextAvailableNumber([1, 3, 4])).toBe(2);
      expect(RoomNameGenerator.findNextAvailableNumber([1, 2, 4])).toBe(3);
    });

    it('should return null if all numbers are used', () => {
      const allNumbers = Array.from({ length: 999 }, (_, i) => i + 1);
      expect(RoomNameGenerator.findNextAvailableNumber(allNumbers)).toBeNull();
    });

    it('should handle duplicate numbers correctly', () => {
      expect(
        RoomNameGenerator.findNextAvailableNumber([1, 1, 2, 2, 3, 3]),
      ).toBe(4);
    });

    it('should handle unordered numbers correctly', () => {
      expect(RoomNameGenerator.findNextAvailableNumber([5, 2, 8, 1, 3])).toBe(
        4,
      );
    });
  });

  describe('generateNextAvailableRoomName', () => {
    it('should generate next available room name', () => {
      expect(RoomNameGenerator.generateNextAvailableRoomName([])).toBe(
        '채팅방 #001',
      );
      expect(
        RoomNameGenerator.generateNextAvailableRoomName(['채팅방 #001']),
      ).toBe('채팅방 #002');
      expect(
        RoomNameGenerator.generateNextAvailableRoomName([
          '채팅방 #001',
          '채팅방 #003',
        ]),
      ).toBe('채팅방 #002');
    });

    it('should ignore invalid room names', () => {
      const usedRoomNames = [
        '채팅방 #001',
        '잘못된 채팅방',
        '채팅방 #003',
        '채팅방 #1000', // 범위 초과
        '',
      ];
      expect(
        RoomNameGenerator.generateNextAvailableRoomName(usedRoomNames),
      ).toBe('채팅방 #002');
    });

    it('should return null if all room names are used', () => {
      const allRoomNames = Array.from(
        { length: 999 },
        (_, i) => `채팅방 #${(i + 1).toString().padStart(3, '0')}`,
      );
      expect(
        RoomNameGenerator.generateNextAvailableRoomName(allRoomNames),
      ).toBeNull();
    });
  });

  describe('utility methods', () => {
    it('should return correct max room count', () => {
      expect(RoomNameGenerator.getMaxRoomCount()).toBe(999);
    });

    it('should return correct room number range', () => {
      const range = RoomNameGenerator.getRoomNumberRange();
      expect(range.min).toBe(1);
      expect(range.max).toBe(999);
    });
  });
});
