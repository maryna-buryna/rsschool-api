import * as Router from 'koa-router';
import { getManager } from 'typeorm';
import { NOT_FOUND, OK, BAD_REQUEST } from 'http-status-codes';
import { setResponse } from '../routes/utils';
import { Mentor, Student } from '../models-pg';
import { ILogger } from '../logger';

type PairInput = {
  studentGithubId: string;
  mentorGithubId: string;
};

export function adminPairsRouter(logger: ILogger) {
  const router = new Router({ prefix: '/v2/:courseId/pairs' });

  router.post('/', async (ctx: Router.RouterContext) => {
    const courseId = Number(ctx.params.courseId);

    if (isNaN(courseId)) {
      setResponse(ctx, BAD_REQUEST);
      return;
    }

    const data: PairInput[] = ctx.request.body;
    const mentorRepository = getManager().getRepository(Mentor);
    const studentRepository = getManager().getRepository(Student);

    if (data === undefined) {
      setResponse(ctx, NOT_FOUND);
      return;
    }

    const result: string[] = [];

    for await (const item of data) {
      try {
        const mentor = await mentorRepository
          .createQueryBuilder('mentor')
          .innerJoinAndSelect('mentor.user', 'user', 'user.githubId = :id', {
            id: item.mentorGithubId,
          })
          .getOne();

        if (mentor == null) {
          result.push(`Cannot find mentor: ${item.mentorGithubId}`);
          continue;
        }

        const student = await studentRepository
          .createQueryBuilder('student')
          .innerJoinAndSelect('student.user', 'user', 'user.githubId = :id', {
            id: item.studentGithubId,
          })
          .getOne();

        if (student == null) {
          result.push(`Cannot find student: ${item.studentGithubId}`);
          continue;
        }

        student.mentor = mentor;
        studentRepository.save(student);
        result.push('ok');
      } catch (e) {
        logger.error(e);
        result.push(e.message);
      }
    }

    setResponse(ctx, OK, { result });
  });
  return router;
}