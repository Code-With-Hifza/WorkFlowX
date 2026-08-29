import { NextResponse } from 'next/server';
import { CommentService } from '@/services/comment.service';
import { z } from 'zod';

const createCommentSchema = z.object({
  organizationId: z.string().min(1, 'Organization slug or ID is required'),
  content: z.string().min(1, 'Comment content cannot be empty'),
});

interface RouteParams {
  params: Promise<{
    taskId: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { taskId } = await params;
    const { searchParams } = new URL(request.url);
    const orgIdOrSlug = searchParams.get('org') || searchParams.get('organizationId');

    if (!orgIdOrSlug) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Organization parameter required.' } },
        { status: 400 }
      );
    }

    const comments = await CommentService.getTaskComments(orgIdOrSlug, taskId);
    return NextResponse.json({ success: true, data: comments });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: err.message } },
      { status: 403 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const parsed = createCommentSchema.parse(body);

    const comment = await CommentService.createComment(
      parsed.organizationId,
      taskId,
      parsed.content
    );

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: err.message } },
      { status: 400 }
    );
  }
}
