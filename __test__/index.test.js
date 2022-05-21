import { server } from "../index";
import supertest from "supertest";
import { jest } from "@jest/globals";

const requestWithSupertest = supertest(server);
// Mock current date time to 2018-07-02T07:56:47.007Z
const dateNowStub = jest.fn(() => 1530518207007);
const queryDate = "2018-07-02T00:00:00.000Z";

global.Date.now = dateNowStub;

describe("API", () => {
  describe("Home controller", () => {
    // This test currently 'fails' because 'listen EADDRINUSE: address already in use :::5000'
    // I tried to fix this by adding some flags into the test script and by adding an after each callback to run server.close()
    // but without success.
    test("GET '/' should return text/html", async () => {
      // Act
      const res = await requestWithSupertest.get("/");
      // Assert
      expect(res.status).toEqual(200);
      expect(res.type).toEqual("text/html");
      expect(res.text).toEqual("There's nothing to see here");
    });
  });

  describe("Users controller", () => {
    describe("GET", () => {
      test("'/users' with no :id or query string should return 404", async () => {
        // Act
        const res = await requestWithSupertest.get(`/users`);
        // Assert
        expect(res.status).toEqual(404);
      });

      test("'/users/:id/rewards' with :id but no query string should return rewards with null date values", async () => {
        // Arrange
        const id = 1;
        // Act
        const res = await requestWithSupertest.get(`/users/${id}/rewards`);
        // Assert
        expect(res.status).toEqual(200);
        expect(res.type).toEqual("application/json");
        expect(res.body).toEqual([]);
      });

      test("'/users/:id/rewards' with :id and query string should return rewards", async () => {
        // Arrange
        const id = 2;
        const expected = [
          {
            availableAt: "2018-06-28T00:00:00.000Z",
            expiresAt: "2018-06-29T00:00:00.000Z",
            redeemedAt: null,
            userId: "2",
          },
          {
            availableAt: "2018-06-29T00:00:00.000Z",
            expiresAt: "2018-06-30T00:00:00.000Z",
            redeemedAt: null,
            userId: "2",
          },
          {
            availableAt: "2018-06-30T00:00:00.000Z",
            expiresAt: "2018-07-01T00:00:00.000Z",
            redeemedAt: null,
            userId: "2",
          },
          {
            availableAt: "2018-07-01T00:00:00.000Z",
            expiresAt: "2018-07-02T00:00:00.000Z",
            redeemedAt: null,
            userId: "2",
          },
          {
            availableAt: "2018-07-02T00:00:00.000Z",
            expiresAt: "2018-07-03T00:00:00.000Z",
            redeemedAt: null,
            userId: "2",
          },
          {
            availableAt: "2018-07-03T00:00:00.000Z",
            expiresAt: "2018-07-04T00:00:00.000Z",
            redeemedAt: null,
            userId: "2",
          },
          {
            availableAt: "2018-07-04T00:00:00.000Z",
            expiresAt: "2018-07-05T00:00:00.000Z",
            redeemedAt: null,
            userId: "2",
          },
        ];
        // Act
        const res = await requestWithSupertest.get(
          `/users/${id}/rewards?at=${queryDate}`
        );
        // Assert
        expect(res.status).toEqual(200);
        expect(res.type).toEqual("application/json");
        expect(res.body).toEqual(expected);
      });
    });

    describe("PATCH", () => {
      test("/users with no :id or :at value should return 404", async () => {
        // Act
        const res = await requestWithSupertest.patch(`/users`);
        // Assert
        expect(res.status).toEqual(404);
      });

      test("/users with :id but no :at value should return 404", async () => {
        // Arrange
        const id = 3;
        await requestWithSupertest.get(`/users/${id}/rewards?at=${queryDate}`);
        // Act
        const res = await requestWithSupertest.patch(`/users/${id}/rewards`);
        // Assert
        expect(res.status).toEqual(404);
      });

      test("/users if reward does not exist should return 404", async () => {
        // Arrange
        const id = 4;
        const aDateThatMatchesNoRewards = "2018-12-25T00:00:00.000Z";

        await requestWithSupertest.get(`/users/${id}/rewards?at=${queryDate}`);
        // Act
        const res = await requestWithSupertest.patch(
          `/users/${id}/rewards/${aDateThatMatchesNoRewards}/redeem`
        );
        // Assert
        expect(res.status).toEqual(404);
        expect(res.error.text).toEqual(
          '{"error":{"message":"This reward for user: 4 could not be found. Sorry."}}'
        );
      });

      test("/users if reward is expired should return 400", async () => {
        // Arrange
        const id = 5;
        const aPastDate = "2018-06-28T00:00:00.000Z";

        await requestWithSupertest.get(`/users/${id}/rewards?at=${aPastDate}`);
        // Act
        const res = await requestWithSupertest.patch(
          `/users/${id}/rewards/${aPastDate}/redeem`
        );
        // Assert
        expect(res.status).toEqual(400);
        expect(res.error.text).toEqual(
          '{"error":{"message":"This reward expired at: Fri Jun 29 2018 09:00:00 GMT+0900 (Japan Standard Time)."}}'
        );
      });

      test("/users should return redeemed reward", async () => {
        // Arrange
        const id = 6;
        const expected = {
          userId: "6",
          availableAt: "2018-07-02T00:00:00.000Z",
          redeemedAt: "2018-07-02T07:56:47.007Z",
          expiresAt: "2018-07-03T00:00:00.000Z",
        };

        await requestWithSupertest.get(`/users/${id}/rewards?at=${queryDate}`);
        // Act
        const res = await requestWithSupertest.patch(
          `/users/${id}/rewards/${queryDate}/redeem`
        );
        // Assert
        expect(res.status).toEqual(200);
        expect(res.type).toEqual("application/json");
        expect(res.body).toEqual(expected);
      });
    });
  });
});
