-- =====================================================
-- User Data Module - Reusable Queries
-- =====================================================
-- Description: Common SQL queries for user operations
-- Version: 1.0.0
-- Created: 2025-01-11
-- =====================================================

-- =====================================================
-- READ OPERATIONS
-- =====================================================

-- Get user by ID
-- Parameters: $1 = user_id (UUID)
-- name: get_user_by_id
SELECT
  id,
  email,
  name,
  avatar,
  bio,
  created_at,
  updated_at
FROM public.users
WHERE id = $1;

-- Get user by email
-- Parameters: $1 = email (TEXT)
-- name: get_user_by_email
SELECT
  id,
  email,
  name,
  avatar,
  bio,
  created_at,
  updated_at
FROM public.users
WHERE email = $1;

-- Get all users with pagination and sorting
-- Parameters: $1 = limit (INT), $2 = offset (INT), $3 = sort_by (TEXT), $4 = sort_order (TEXT)
-- name: get_users_paginated
SELECT
  id,
  email,
  name,
  avatar,
  bio,
  created_at,
  updated_at
FROM public.users
ORDER BY
  CASE WHEN $3 = 'name' AND $4 = 'asc' THEN name END ASC,
  CASE WHEN $3 = 'name' AND $4 = 'desc' THEN name END DESC,
  CASE WHEN $3 = 'email' AND $4 = 'asc' THEN email END ASC,
  CASE WHEN $3 = 'email' AND $4 = 'desc' THEN email END DESC,
  CASE WHEN $3 = 'createdAt' AND $4 = 'asc' THEN created_at END ASC,
  CASE WHEN $3 = 'createdAt' AND $4 = 'desc' THEN created_at END DESC,
  created_at DESC -- Default sort
LIMIT $1
OFFSET $2;

-- Search users by name or bio (full-text search)
-- Parameters: $1 = search_term (TEXT), $2 = limit (INT), $3 = offset (INT)
-- name: search_users
SELECT
  id,
  email,
  name,
  avatar,
  bio,
  created_at,
  updated_at,
  ts_rank(
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(bio, '')),
    plainto_tsquery('english', $1)
  ) AS rank
FROM public.users
WHERE to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(bio, ''))
  @@ plainto_tsquery('english', $1)
ORDER BY rank DESC, created_at DESC
LIMIT $2
OFFSET $3;

-- Count total users
-- name: count_users
SELECT COUNT(*) as total
FROM public.users;

-- Count users matching search
-- Parameters: $1 = search_term (TEXT)
-- name: count_users_search
SELECT COUNT(*) as total
FROM public.users
WHERE to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(bio, ''))
  @@ plainto_tsquery('english', $1);

-- =====================================================
-- CREATE OPERATIONS
-- =====================================================

-- Create new user
-- Parameters: $1 = email, $2 = name, $3 = bio (nullable)
-- name: create_user
INSERT INTO public.users (email, name, bio)
VALUES ($1, $2, $3)
RETURNING
  id,
  email,
  name,
  avatar,
  bio,
  created_at,
  updated_at;

-- =====================================================
-- UPDATE OPERATIONS
-- =====================================================

-- Update user profile
-- Parameters: $1 = user_id, $2 = name, $3 = bio, $4 = avatar
-- name: update_user
UPDATE public.users
SET
  name = COALESCE($2, name),
  bio = COALESCE($3, bio),
  avatar = COALESCE($4, avatar)
WHERE id = $1
RETURNING
  id,
  email,
  name,
  avatar,
  bio,
  created_at,
  updated_at;

-- Update user avatar only
-- Parameters: $1 = user_id, $2 = avatar_url
-- name: update_user_avatar
UPDATE public.users
SET avatar = $2
WHERE id = $1
RETURNING
  id,
  email,
  name,
  avatar,
  bio,
  created_at,
  updated_at;

-- =====================================================
-- DELETE OPERATIONS
-- =====================================================

-- Delete user by ID
-- Parameters: $1 = user_id
-- name: delete_user
DELETE FROM public.users
WHERE id = $1;

-- Soft delete alternative (if you want to add deleted_at column later)
-- UPDATE public.users
-- SET deleted_at = NOW()
-- WHERE id = $1 AND deleted_at IS NULL;

-- =====================================================
-- UTILITY QUERIES
-- =====================================================

-- Check if email exists
-- Parameters: $1 = email
-- name: email_exists
SELECT EXISTS(
  SELECT 1
  FROM public.users
  WHERE email = $1
) as exists;

-- Get recently created users
-- Parameters: $1 = limit (INT)
-- name: get_recent_users
SELECT
  id,
  email,
  name,
  avatar,
  bio,
  created_at,
  updated_at
FROM public.users
ORDER BY created_at DESC
LIMIT $1;

-- Get user statistics
-- name: get_user_stats
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as users_last_week,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as users_last_month,
  COUNT(CASE WHEN bio IS NOT NULL THEN 1 END) as users_with_bio,
  COUNT(CASE WHEN avatar IS NOT NULL THEN 1 END) as users_with_avatar
FROM public.users;
