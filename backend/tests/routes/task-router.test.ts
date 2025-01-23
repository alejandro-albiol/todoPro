import request from 'supertest';
import express from 'express';
import { taskRouter } from '../../src/routes/task-router';
import { TaskService } from '../../src/tasks/service/task-service';
import { mockTask, mockTaskInput } from '../__mocks__/task-mock';

const app = express();
app.use(express.json());
app.use('/tasks', taskRouter);

jest.mock('../../src/tasks/service/task-service');

describe('TaskRouter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /', () => {
        it('should create a task', async () => {
            const spy = jest.spyOn(TaskService.prototype, 'create')
                .mockResolvedValueOnce(mockTask);

            const response = await request(app)
                .post('/tasks')
                .send(mockTaskInput);

            expect(response.status).toBe(201);
            expect(spy).toHaveBeenCalledWith(mockTaskInput);
            expect(response.body.data).toEqual(mockTask);
        });
    });

    describe('GET /user/:userId', () => {
        it('should get all tasks for user', async () => {
            const spy = jest.spyOn(TaskService.prototype, 'findAllByUserId')
                .mockResolvedValueOnce([mockTask]);

            const response = await request(app)
                .get('/tasks/user/1');

            expect(response.status).toBe(200);
            expect(spy).toHaveBeenCalledWith('1');
            expect(response.body.data).toEqual([mockTask]);
        });
    });

    describe('GET /:id', () => {
        it('should get a task by id', async () => {
            const spy = jest.spyOn(TaskService.prototype, 'findById')
                .mockResolvedValueOnce(mockTask);

            const response = await request(app)
                .get('/tasks/1');

            expect(response.status).toBe(200);
            expect(spy).toHaveBeenCalledWith('1');
            expect(response.body.data).toEqual(mockTask);
        });
    });

    describe('PUT /:id', () => {
        it('should update a task', async () => {
            const updatedTask = { ...mockTask, title: 'Updated Task' };
            const spy = jest.spyOn(TaskService.prototype, 'update')
                .mockResolvedValueOnce(updatedTask);

            const response = await request(app)
                .put('/tasks/1')
                .send({ title: 'Updated Task' });

            expect(response.status).toBe(200);
            expect(spy).toHaveBeenCalledWith({ id: '1', title: 'Updated Task' });
            expect(response.body.data).toEqual(updatedTask);
        });
    });

    describe('PUT /:id/toggle', () => {
        it('should toggle task completion', async () => {
            const toggledTask = { ...mockTask, completed: !mockTask.completed };
            const spy = jest.spyOn(TaskService.prototype, 'toggleCompleted')
                .mockResolvedValueOnce(toggledTask);

            const response = await request(app)
                .put('/tasks/1/toggle');

            expect(response.status).toBe(200);
            expect(spy).toHaveBeenCalledWith('1');
            expect(response.body.data).toEqual(toggledTask);
        });
    });

    describe('DELETE /:id', () => {
        it('should delete a task', async () => {
            const spy = jest.spyOn(TaskService.prototype, 'delete')
                .mockResolvedValueOnce();

            const response = await request(app)
                .delete('/tasks/1');

            expect(response.status).toBe(200);
            expect(spy).toHaveBeenCalledWith('1');
            expect(response.body.data).toBeNull();
        });
    });

    describe('Validation Middleware', () => {
        it('should return 400 when creating task with invalid data', async () => {
            const response = await request(app)
                .post('/tasks')
                .send({});  // Invalid data: missing required fields

            expect(response.status).toBe(400);
        });

        it('should return 400 when updating task with invalid id', async () => {
            const response = await request(app)
                .put('/tasks/invalid-id')
                .send({ title: 'Updated Task' });

            expect(response.status).toBe(400);
        });
    });
}); 