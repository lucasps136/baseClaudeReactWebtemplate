import { UserValidation } from "../../src/validations/user.validation";
import type { CreateUserInput, UpdateUserInput } from "../../src/types";

describe("UserValidation", () => {
  let validation: UserValidation;

  beforeEach(() => {
    validation = new UserValidation();
  });

  // ============================================================================
  // validateEmail Tests
  // ============================================================================

  describe("validateEmail", () => {
    it("should validate correct email format", () => {
      expect(validation.validateEmail("test@example.com")).toBe(true);
      expect(validation.validateEmail("user.name@domain.com")).toBe(true);
      expect(validation.validateEmail("user+tag@example.co.uk")).toBe(true);
      expect(validation.validateEmail("user_name@test-domain.com")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      expect(validation.validateEmail("invalid")).toBe(false);
      expect(validation.validateEmail("invalid@")).toBe(false);
      expect(validation.validateEmail("@domain.com")).toBe(false);
      expect(validation.validateEmail("user@")).toBe(false);
      expect(validation.validateEmail("user@domain")).toBe(false);
      expect(validation.validateEmail("user domain@test.com")).toBe(false);
      expect(validation.validateEmail("")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(validation.validateEmail("a@b.c")).toBe(true); // Minimal valid email
      expect(validation.validateEmail("user..name@domain.com")).toBe(true); // Double dot (technically valid per regex)
    });
  });

  // ============================================================================
  // validateCreateInput Tests
  // ============================================================================

  describe("validateCreateInput", () => {
    const validInput: CreateUserInput = {
      email: "valid@example.com",
      name: "Valid Name",
      bio: "Valid bio",
    };

    // Email validation
    describe("Email Validation", () => {
      it("should pass with valid email", async () => {
        await expect(
          validation.validateCreateInput(validInput),
        ).resolves.not.toThrow();
      });

      it("should throw error when email is missing", async () => {
        const invalidInput = { ...validInput, email: "" };

        await expect(
          validation.validateCreateInput(invalidInput),
        ).rejects.toThrow("Validation failed: Email is required");
      });

      it("should throw error when email format is invalid", async () => {
        const invalidInput = { ...validInput, email: "invalid-email" };

        await expect(
          validation.validateCreateInput(invalidInput),
        ).rejects.toThrow("Validation failed: Invalid email format");
      });

      it("should throw error for email without domain", async () => {
        const invalidInput = { ...validInput, email: "user@" };

        await expect(
          validation.validateCreateInput(invalidInput),
        ).rejects.toThrow("Validation failed: Invalid email format");
      });
    });

    // Name validation
    describe("Name Validation", () => {
      it("should pass with valid name", async () => {
        await expect(
          validation.validateCreateInput(validInput),
        ).resolves.not.toThrow();
      });

      it("should throw error when name is missing", async () => {
        const invalidInput = { ...validInput, name: "" };

        await expect(
          validation.validateCreateInput(invalidInput),
        ).rejects.toThrow("Validation failed: Name is required");
      });

      it("should throw error when name is too short", async () => {
        const invalidInput = { ...validInput, name: "A" };

        await expect(
          validation.validateCreateInput(invalidInput),
        ).rejects.toThrow(
          "Validation failed: Name must be at least 2 characters",
        );
      });

      it("should pass with minimum valid name length", async () => {
        const validMinInput = { ...validInput, name: "Ab" };

        await expect(
          validation.validateCreateInput(validMinInput),
        ).resolves.not.toThrow();
      });

      it("should throw error when name is too long", async () => {
        const longName = "A".repeat(101);
        const invalidInput = { ...validInput, name: longName };

        await expect(
          validation.validateCreateInput(invalidInput),
        ).rejects.toThrow(
          "Validation failed: Name must be less than 100 characters",
        );
      });

      it("should pass with maximum valid name length", async () => {
        const maxName = "A".repeat(100);
        const validMaxInput = { ...validInput, name: maxName };

        await expect(
          validation.validateCreateInput(validMaxInput),
        ).resolves.not.toThrow();
      });
    });

    // Bio validation
    describe("Bio Validation", () => {
      it("should pass without bio (optional field)", async () => {
        const inputWithoutBio: CreateUserInput = {
          email: "test@example.com",
          name: "Test User",
        };

        await expect(
          validation.validateCreateInput(inputWithoutBio),
        ).resolves.not.toThrow();
      });

      it("should pass with empty bio string", async () => {
        const inputWithEmptyBio = { ...validInput, bio: "" };

        await expect(
          validation.validateCreateInput(inputWithEmptyBio),
        ).resolves.not.toThrow();
      });

      it("should pass with valid bio", async () => {
        const inputWithBio = { ...validInput, bio: "This is a valid bio" };

        await expect(
          validation.validateCreateInput(inputWithBio),
        ).resolves.not.toThrow();
      });

      it("should throw error when bio is too long", async () => {
        const longBio = "A".repeat(501);
        const invalidInput = { ...validInput, bio: longBio };

        await expect(
          validation.validateCreateInput(invalidInput),
        ).rejects.toThrow(
          "Validation failed: Bio must be less than 500 characters",
        );
      });

      it("should pass with maximum valid bio length", async () => {
        const maxBio = "A".repeat(500);
        const validMaxInput = { ...validInput, bio: maxBio };

        await expect(
          validation.validateCreateInput(validMaxInput),
        ).resolves.not.toThrow();
      });
    });

    // Multiple errors
    describe("Multiple Validation Errors", () => {
      it("should collect all validation errors", async () => {
        const invalidInput: CreateUserInput = {
          email: "",
          name: "A",
          bio: "A".repeat(501),
        };

        await expect(
          validation.validateCreateInput(invalidInput),
        ).rejects.toThrow("Validation failed:");

        try {
          await validation.validateCreateInput(invalidInput);
        } catch (error) {
          expect((error as Error).message).toContain("Email is required");
          expect((error as Error).message).toContain(
            "Name must be at least 2 characters",
          );
          expect((error as Error).message).toContain(
            "Bio must be less than 500 characters",
          );
        }
      });

      it("should report both email and name errors", async () => {
        const invalidInput: CreateUserInput = {
          email: "invalid",
          name: "",
        };

        try {
          await validation.validateCreateInput(invalidInput);
        } catch (error) {
          expect((error as Error).message).toContain("Name is required");
          expect((error as Error).message).toContain("Invalid email format");
        }
      });
    });
  });

  // ============================================================================
  // validateUpdateInput Tests
  // ============================================================================

  describe("validateUpdateInput", () => {
    const validUpdate: UpdateUserInput = {
      name: "Updated Name",
      bio: "Updated bio",
      avatar: "https://example.com/avatar.jpg",
    };

    it("should pass with valid update input", async () => {
      await expect(
        validation.validateUpdateInput(validUpdate),
      ).resolves.not.toThrow();
    });

    it("should pass with empty update (all fields optional)", async () => {
      const emptyUpdate: UpdateUserInput = {};

      await expect(
        validation.validateUpdateInput(emptyUpdate),
      ).resolves.not.toThrow();
    });

    // Name validation
    describe("Name Validation (Optional)", () => {
      it("should pass when name is not provided", async () => {
        const updateWithoutName: UpdateUserInput = {
          bio: "Just bio update",
        };

        await expect(
          validation.validateUpdateInput(updateWithoutName),
        ).resolves.not.toThrow();
      });

      it("should pass with valid name", async () => {
        const updateWithName: UpdateUserInput = {
          name: "Valid Name",
        };

        await expect(
          validation.validateUpdateInput(updateWithName),
        ).resolves.not.toThrow();
      });

      it("should throw error when name is too short", async () => {
        const invalidUpdate: UpdateUserInput = {
          name: "A",
        };

        await expect(
          validation.validateUpdateInput(invalidUpdate),
        ).rejects.toThrow(
          "Validation failed: Name must be at least 2 characters",
        );
      });

      it("should throw error when name is too long", async () => {
        const invalidUpdate: UpdateUserInput = {
          name: "A".repeat(101),
        };

        await expect(
          validation.validateUpdateInput(invalidUpdate),
        ).rejects.toThrow(
          "Validation failed: Name must be less than 100 characters",
        );
      });

      it("should pass with minimum valid name length", async () => {
        const validMinUpdate: UpdateUserInput = {
          name: "Ab",
        };

        await expect(
          validation.validateUpdateInput(validMinUpdate),
        ).resolves.not.toThrow();
      });

      it("should pass with maximum valid name length", async () => {
        const validMaxUpdate: UpdateUserInput = {
          name: "A".repeat(100),
        };

        await expect(
          validation.validateUpdateInput(validMaxUpdate),
        ).resolves.not.toThrow();
      });
    });

    // Bio validation
    describe("Bio Validation (Optional)", () => {
      it("should pass when bio is not provided", async () => {
        const updateWithoutBio: UpdateUserInput = {
          name: "Just name update",
        };

        await expect(
          validation.validateUpdateInput(updateWithoutBio),
        ).resolves.not.toThrow();
      });

      it("should pass with empty bio string", async () => {
        const updateWithEmptyBio: UpdateUserInput = {
          bio: "",
        };

        await expect(
          validation.validateUpdateInput(updateWithEmptyBio),
        ).resolves.not.toThrow();
      });

      it("should pass with valid bio", async () => {
        const updateWithBio: UpdateUserInput = {
          bio: "This is a valid updated bio",
        };

        await expect(
          validation.validateUpdateInput(updateWithBio),
        ).resolves.not.toThrow();
      });

      it("should throw error when bio is too long", async () => {
        const invalidUpdate: UpdateUserInput = {
          bio: "A".repeat(501),
        };

        await expect(
          validation.validateUpdateInput(invalidUpdate),
        ).rejects.toThrow(
          "Validation failed: Bio must be less than 500 characters",
        );
      });

      it("should pass with maximum valid bio length", async () => {
        const validMaxUpdate: UpdateUserInput = {
          bio: "A".repeat(500),
        };

        await expect(
          validation.validateUpdateInput(validMaxUpdate),
        ).resolves.not.toThrow();
      });
    });

    // Avatar validation
    describe("Avatar Validation (Optional)", () => {
      it("should pass when avatar is not provided", async () => {
        const updateWithoutAvatar: UpdateUserInput = {
          name: "Name only",
        };

        await expect(
          validation.validateUpdateInput(updateWithoutAvatar),
        ).resolves.not.toThrow();
      });

      it("should pass with valid HTTP URL", async () => {
        const updateWithAvatar: UpdateUserInput = {
          avatar: "http://example.com/avatar.jpg",
        };

        await expect(
          validation.validateUpdateInput(updateWithAvatar),
        ).resolves.not.toThrow();
      });

      it("should pass with valid HTTPS URL", async () => {
        const updateWithAvatar: UpdateUserInput = {
          avatar: "https://example.com/avatar.jpg",
        };

        await expect(
          validation.validateUpdateInput(updateWithAvatar),
        ).resolves.not.toThrow();
      });

      it("should pass with URL containing path and query params", async () => {
        const updateWithAvatar: UpdateUserInput = {
          avatar:
            "https://cdn.example.com/users/avatars/123.jpg?size=large&format=webp",
        };

        await expect(
          validation.validateUpdateInput(updateWithAvatar),
        ).resolves.not.toThrow();
      });

      it("should throw error for invalid URL", async () => {
        const invalidUpdate: UpdateUserInput = {
          avatar: "not-a-url",
        };

        await expect(
          validation.validateUpdateInput(invalidUpdate),
        ).rejects.toThrow("Validation failed: Avatar must be a valid URL");
      });

      it("should throw error for malformed URL", async () => {
        const invalidUpdate: UpdateUserInput = {
          avatar: "just-a-string",
        };

        await expect(
          validation.validateUpdateInput(invalidUpdate),
        ).rejects.toThrow("Validation failed: Avatar must be a valid URL");
      });

      it("should throw error for empty URL string", async () => {
        const invalidUpdate: UpdateUserInput = {
          avatar: "",
        };

        await expect(
          validation.validateUpdateInput(invalidUpdate),
        ).rejects.toThrow("Validation failed: Avatar must be a valid URL");
      });
    });

    // Multiple errors
    describe("Multiple Validation Errors", () => {
      it("should collect all validation errors", async () => {
        const invalidUpdate: UpdateUserInput = {
          name: "A",
          bio: "A".repeat(501),
          avatar: "invalid-url",
        };

        await expect(
          validation.validateUpdateInput(invalidUpdate),
        ).rejects.toThrow("Validation failed:");

        try {
          await validation.validateUpdateInput(invalidUpdate);
        } catch (error) {
          expect((error as Error).message).toContain(
            "Name must be at least 2 characters",
          );
          expect((error as Error).message).toContain(
            "Bio must be less than 500 characters",
          );
          expect((error as Error).message).toContain(
            "Avatar must be a valid URL",
          );
        }
      });

      it("should report multiple field errors together", async () => {
        const invalidUpdate: UpdateUserInput = {
          name: "A".repeat(101),
          bio: "A".repeat(501),
        };

        try {
          await validation.validateUpdateInput(invalidUpdate);
        } catch (error) {
          expect((error as Error).message).toContain(
            "Name must be less than 100 characters",
          );
          expect((error as Error).message).toContain(
            "Bio must be less than 500 characters",
          );
        }
      });
    });
  });

  // ============================================================================
  // Edge Cases and Special Scenarios
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle undefined vs empty string for optional fields", async () => {
      const undefinedInput: CreateUserInput = {
        email: "test@example.com",
        name: "Test",
        bio: undefined,
      };

      const emptyInput: CreateUserInput = {
        email: "test@example.com",
        name: "Test",
        bio: "",
      };

      await expect(
        validation.validateCreateInput(undefinedInput),
      ).resolves.not.toThrow();
      await expect(
        validation.validateCreateInput(emptyInput),
      ).resolves.not.toThrow();
    });

    it("should handle special characters in name", async () => {
      const specialCharInput: CreateUserInput = {
        email: "test@example.com",
        name: "O'Connor-Smith Jr.",
      };

      await expect(
        validation.validateCreateInput(specialCharInput),
      ).resolves.not.toThrow();
    });

    it("should handle unicode characters in name and bio", async () => {
      const unicodeInput: CreateUserInput = {
        email: "test@example.com",
        name: "José García",
        bio: "Hello 世界 🌍",
      };

      await expect(
        validation.validateCreateInput(unicodeInput),
      ).resolves.not.toThrow();
    });

    it("should reject email with spaces", async () => {
      const spacedInput: CreateUserInput = {
        email: "  test@example.com  ",
        name: "Test User",
      };

      // Email regex does not allow leading/trailing spaces
      await expect(validation.validateCreateInput(spacedInput)).rejects.toThrow(
        "Validation failed: Invalid email format",
      );
    });

    it("should accept name with spaces (service handles trimming if needed)", async () => {
      const spacedNameInput: CreateUserInput = {
        email: "test@example.com",
        name: "  Test User  ",
      };

      // Name with spaces is valid, service layer should trim if necessary
      await expect(
        validation.validateCreateInput(spacedNameInput),
      ).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // Performance and Async Behavior
  // ============================================================================

  describe("Performance", () => {
    it("should validate synchronously despite async interface", async () => {
      const input: CreateUserInput = {
        email: "test@example.com",
        name: "Test User",
      };

      const start = Date.now();
      await validation.validateCreateInput(input);
      const duration = Date.now() - start;

      // Validation should be essentially instant (< 10ms)
      expect(duration).toBeLessThan(10);
    });

    it("should handle multiple validations concurrently", async () => {
      const inputs: CreateUserInput[] = Array(100)
        .fill(null)
        .map((_, i) => ({
          email: `user${i}@example.com`,
          name: `User ${i}`,
        }));

      const validations = inputs.map((input) =>
        validation.validateCreateInput(input),
      );

      await expect(Promise.all(validations)).resolves.not.toThrow();
    });
  });
});
