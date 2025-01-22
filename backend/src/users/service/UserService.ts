import { IUserService } from './IUserService.js';
import { CreateUserDTO } from '../models/dtos/CreateUserDTO.js';
import { UpdateUserDTO } from '../models/dtos/UpdateUserDTO.js';
import { UpdatedUserDTO } from '../models/dtos/UpdatedUserDTO.js';
import { User } from '../models/entities/User.js';
import { UserRepository } from '../repository/UserRepository.js';
import { UserNotFoundException } from '../exceptions/user-not-found.exception.js';
import { EmailAlreadyExistsException } from '../exceptions/email-already-exists.exception.js';
import { UsernameAlreadyExistsException } from '../exceptions/username-already-exists.exception.js';
import { DataBaseErrorCode } from '../../shared/exceptions/enums/DataBaseErrorCode.enum.js';
import { DataBaseException } from '../../shared/exceptions/DataBaseException.js';
import { HashServices } from '../../shared/services/HashServices.js';
import { InvalidUserDataException } from '../exceptions/invalid-user-data.exception.js';
import { UserCreationFailedException } from '../exceptions/user-creation-failed.exception.js';

export class UserService implements IUserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async create(userData: CreateUserDTO): Promise<User> {
    try {
      const hashedPassword = await HashServices.hashPassword(userData.password);
      const userWithHashedPassword = { ...userData, password: hashedPassword };
      const user = await this.userRepository.create(userWithHashedPassword);
      if (!user) {
        throw new UserCreationFailedException('Failed to create user');
      }
      return user;
    } catch (error) {
      if (error instanceof DataBaseException) {
        if (error.code === DataBaseErrorCode.UNIQUE_VIOLATION) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('email')) {
            throw new EmailAlreadyExistsException(userData.email || 'unknown');
          }
          if (errorMessage.includes('username')) {
            throw new UsernameAlreadyExistsException(userData.username || 'unknown');
          }
        }
        if (error.code === DataBaseErrorCode.INVALID_INPUT) {
          throw new InvalidUserDataException('Invalid user data format');
        }
      }
      throw new DataBaseException('Error creating user', DataBaseErrorCode.UNKNOWN_ERROR);
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new UserNotFoundException(id);
      }
      return user;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      if (error instanceof DataBaseException) {
        if (error.code === DataBaseErrorCode.NOT_FOUND) {
          throw new UserNotFoundException(id);
        }
        if (error.code === DataBaseErrorCode.INVALID_INPUT) {
          throw new InvalidUserDataException('Invalid user ID format');
        }
        throw error;
      }
      throw new DataBaseException('Error finding user', DataBaseErrorCode.UNKNOWN_ERROR);
    }
  }

  async update(userData: UpdateUserDTO): Promise<UpdatedUserDTO> {
    try {
      const user = await this.userRepository.update(userData);
      if (!user) {
        throw new UserNotFoundException(userData.id);
      }
      return user;
    } catch (error) {
      if (error instanceof DataBaseException) {
        if (error.code === DataBaseErrorCode.UNIQUE_VIOLATION) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('email')) {
            throw new EmailAlreadyExistsException(userData.email || 'unknown');
          }
          if (errorMessage.includes('username')) {
            throw new UsernameAlreadyExistsException(userData.username || 'unknown');
          }
        }
        if (error.code === DataBaseErrorCode.NOT_FOUND) {
          throw new UserNotFoundException(userData.id);
        }
        if (error.code === DataBaseErrorCode.INVALID_INPUT) {
          throw new InvalidUserDataException('Invalid user data format');
        }
      }
      throw new DataBaseException('Error updating user', DataBaseErrorCode.UNKNOWN_ERROR);
    }
  }

  async updatePassword(id: string, password: string): Promise<void> {
    try {
      const hashedPassword = await HashServices.hashPassword(password);
      await this.userRepository.updatePassword(id, hashedPassword);
    } catch (error) {
      if (error instanceof DataBaseException) {
        if (error.code === DataBaseErrorCode.NOT_FOUND) {
          throw new UserNotFoundException(id);
        }
        if (error.code === DataBaseErrorCode.INVALID_INPUT) {
          throw new InvalidUserDataException('Invalid password format');
        }
      }
      throw new DataBaseException('Error updating password', DataBaseErrorCode.UNKNOWN_ERROR);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.userRepository.delete(id);
    } catch (error) {
      if (error instanceof DataBaseException) {
        if (error.code === DataBaseErrorCode.NOT_FOUND) {
          throw new UserNotFoundException(id);
        }
        if (error.code === DataBaseErrorCode.INVALID_INPUT) {
          throw new InvalidUserDataException('Invalid user ID format');
        }
      }
      throw new DataBaseException('Error deleting user', DataBaseErrorCode.UNKNOWN_ERROR);
    }
  }
}
