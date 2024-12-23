"USE SCRIPT";
import { createClient, RedisClientType } from "redis";
import { AuthManager } from "./AuthManager"; // .js
import { UserManager } from "./UserManager"; // .js
import { ERRORMESSAGE, SendMessage } from "./types"; // .js
("END");

export class RoomManager {
  private static instance: RoomManager;
  private subscriptions: Map<string, string[]>;
  private reverseSubscriptions: Map<string, string[]>;
  private subscriberClient: RedisClientType;
  private publisherClient: RedisClientType;

  private constructor() {
    this.subscriptions = new Map();
    this.reverseSubscriptions = new Map();
    this.subscriberClient = createClient();
    this.publisherClient = createClient();
  }

  public static getInstance(): RoomManager {
    if (!this.instance) {
      this.instance = new RoomManager();
    }
    return this.instance;
  }

  public async connectRedis() {
    try {
      await Promise.all([
        this.subscriberClient.connect(),
        this.publisherClient.connect(),
      ]);
      console.log("Redis connected successfully.");
    } catch (error) {
      console.log("Connection error in redis client: ", error);
      process.exit(1);
    }
  }

  public subscribe(room: string, id: string) {
    const roomId = AuthManager.getInstance().validateRoom(room, id);
    if (!roomId) {
      UserManager.getInstance().getUser(id)?.emit({
        method: ERRORMESSAGE,
        message: "Unauthorised: Invalid room or not authorised",
      });
      return;
    }
    if (this.subscriptions.get(id)?.includes(roomId)) {
      UserManager.getInstance()
        .getUser(id)
        ?.emit({ method: ERRORMESSAGE, message: "Already subscribed to room" });
      return;
    }
    this.subscriptions.set(
      id,
      (this.subscriptions.get(id) || []).concat(roomId)
    );
    this.reverseSubscriptions.set(
      roomId,
      (this.reverseSubscriptions.get(roomId) || []).concat(id)
    );

    if (this.reverseSubscriptions.get(roomId)?.length === 1) {
      this.subscriberClient.subscribe(roomId, this.redisCallbackHandler);
    }
  }

  public publish(room: string, userId: string, message: string) {
    const roomId = AuthManager.getInstance().validateRoom(room, userId);
    if (!roomId) {
      UserManager.getInstance()
        .getUser(userId)
        ?.emit({
          method: ERRORMESSAGE,
          message: "Unauthorised: Invalid room or not authorised",
        });
      return;
    }
    this.publisherClient.publish(roomId, message);
  }

  private redisCallbackHandler(message: string, roomId: string) {
    const parsedMessage: SendMessage = JSON.parse(message);
    this.reverseSubscriptions.get(roomId)?.forEach((subscriber) => {
      if (parsedMessage.senderId !== subscriber) {
        UserManager.getInstance().getUser(subscriber)?.emit(parsedMessage);
      }
    });
  }

  public unsubscribe(userId: string, roomId: string) {
    const subscriptions = this.subscriptions.get(userId);
    if (subscriptions) {
      this.subscriptions.set(
        userId,
        subscriptions.filter((room) => room !== roomId)
      );
    }
    const reverseSubscriptions = this.reverseSubscriptions.get(roomId);
    if (reverseSubscriptions) {
      this.reverseSubscriptions.set(
        roomId,
        reverseSubscriptions.filter((subsciber) => subsciber !== userId)
      );
      if (this.reverseSubscriptions.get(roomId)?.length === 0) {
        this.reverseSubscriptions.delete(roomId);
        this.subscriberClient.unsubscribe(roomId);
      }
    }
  }

  public userLeft(userId: string) {
    console.log("Clinet left: ", userId);
    this.subscriptions
      .get(userId)
      ?.forEach((roomId) => this.unsubscribe(userId, roomId));
    this.subscriptions.delete(userId);
  }
}
