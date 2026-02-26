'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// --- User Actions on frontend ---

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // If it's the very first user, make them ADMIN and Active automatically
    const userCount = await prisma.user.count();
    const isFirst = userCount === 0;

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: isFirst ? 'ADMIN' : 'EDITOR',
        isActive: isFirst ? true : false
      }
    });
    return { success: true, message: "Registered! Ask admin to enable account." };
  } catch (e) {
    return { success: false, message: "Email already exists." };
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean, role: 'ADMIN' | 'EDITOR') {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive, role }
  });
  revalidatePath('/admin');
}

// --- Post Actions ---

export async function createPost(authorId: string, formData: FormData) {
  const content = formData.get('content') as string;
  const image = formData.get('image') as File;
  
  let imageBase64 = null;

  if (image && image.size > 0) {
    if (image.size > 100 * 1024) return { error: "Image too large (>100kB)" };
    
    // Convert to buffer then base64
    const buffer = Buffer.from(await image.arrayBuffer());
    imageBase64 = `data:${image.type};base64,${buffer.toString('base64')}`;
  }

  await prisma.post.create({
    data: {
      content,
      imageBase64,
      authorId
    }
  });
  revalidatePath('/');
  return { success: true };
}

export async function deletePost(postId: string) {
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath('/');
}

export async function toggleReaction(postId: string, userId: string, type: 'like' | 'dislike') {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return;

  const alreadyLiked = post.likedBy.includes(userId);
  const alreadyDisliked = post.dislikedBy.includes(userId);

  let newLikedBy = [...post.likedBy];
  let newDislikedBy = [...post.dislikedBy];

  if (type === 'like') {
    if (alreadyLiked) {
      newLikedBy = newLikedBy.filter(id => id !== userId); // Unlike
    } else {
      newLikedBy.push(userId);
      newDislikedBy = newDislikedBy.filter(id => id !== userId); // Remove dislike if exists
    }
  } else {
    if (alreadyDisliked) {
      newDislikedBy = newDislikedBy.filter(id => id !== userId); // Undislike
    } else {
      newDislikedBy.push(userId);
      newLikedBy = newLikedBy.filter(id => id !== userId); // Remove like if exists
    }
  }

  await prisma.post.update({
    where: { id: postId },
    data: { likedBy: newLikedBy, dislikedBy: newDislikedBy }
  });
  revalidatePath('/');
}