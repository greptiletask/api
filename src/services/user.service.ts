import User from "../models/user.model";
import { clerkClient } from "../configs/auth.config";
class UserService {
  async createUser(user: any) {
    try {
      const existingUser = await User.findOne({ sub: user.sub });
      if (existingUser) {
        return {
          status: 200,
          user: existingUser,
        };
      }

      const newUser = new User(user);
      await newUser.save();

      return {
        status: 200,
        user: newUser,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        status: 500,
        error: "Failed to create user",
      };
    }
  }

  async fetchOrCreateUser(userSub: string) {
    if (!userSub) {
      return { status: 401, message: "User sub not found" };
    }

    try {
      let user = await User.findOne({ sub: userSub });
      console.log("user from db", user);

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(userSub);

        const { status, user: newUser } = await this.createUser({
          sub: userSub,
          email: clerkUser.emailAddresses[0].emailAddress,
          accessToken: null,
        });

        if (status !== 200) {
          return { status: 500, message: "Failed to create new user" };
        }

        user = newUser;
      }

      return { user, status: 200 };
    } catch (error) {
      console.error("Error fetching or creating user:", error);
      return { status: 500, message: "Internal server error" };
    }
  }
  async fetchUser(userSub: string) {
    try {
      const user = await User.findOne({ sub: userSub });
      if (!user) {
        return { error: "User not found" };
      }
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }
}

const userService = new UserService();

export default userService;
