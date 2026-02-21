-- Enable pgvector extension
create extension if not exists vector;

-- Create documents table to store metadata about uploaded PDFs/Videos
create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    source_type text not null, -- 'youtube' or 'pdf'
    source_url text, -- Only for youtube
    title text,
    created_at timestamp with time zone default now()
);

-- Create chunks table to store text chunks and their embeddings
create table if not exists document_chunks (
    id uuid primary key default gen_random_uuid(),
    document_id uuid references documents(id) on delete cascade,
    content text not null,
    metadata jsonb,
    embedding vector(768), -- Gemini text-embedding models usually output 768 dimensions by default. Adjust if using a different size.
    created_at timestamp with time zone default now()
);

-- Index for similarity search
create index on document_chunks using hnsw (embedding vector_ip_ops);

-- Create flashcards table
create table if not exists flashcards (
    id uuid primary key default gen_random_uuid(),
    document_id uuid references documents(id) on delete cascade,
    front text not null,
    back text not null,
    created_at timestamp with time zone default now()
);

-- Create quizzes table
create table if not exists quizzes (
    id uuid primary key default gen_random_uuid(),
    document_id uuid references documents(id) on delete cascade,
    question text not null,
    options jsonb not null, -- Array of strings
    correct_answer text not null,
    created_at timestamp with time zone default now()
);

-- Create a function to search for matching document chunks
create or replace function match_document_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  doc_id uuid
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where document_chunks.document_id = doc_id
    and 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
$$;
