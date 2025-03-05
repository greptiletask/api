import User from "../models/user.model";

class UserService {
  async fetchUser(userSub: string) {
    try {
      const user = await User.findOne({ sub: userSub });
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }
}

const userService = new UserService();

export default userService;
