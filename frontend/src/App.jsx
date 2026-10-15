import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/books'

export default function App () {
  const [books, setBooks] = useState([])
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadBooks () {
    try {
      const res = await fetch(API)
      if (!res.ok) throw new Error('Could not load books')
      setBooks(await res.json())
      setError('')
    } catch {
      setError('Backend is not connected yet. Start the server to save books.')
    }
  }

  useEffect(() => {
    loadBooks()
  }, [])

  async function addBook (e) {
    e.preventDefault()
    if (!title.trim() || !author.trim()) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim()
        })
      })
      if (!res.ok) throw new Error('Could not add book')
      const book = await res.json()
      setBooks(old => [...old, book])
      setTitle('')
      setAuthor('')
    } catch {
      setError('Could not add book. Check the backend connection.')
    } finally {
      setLoading(false)
    }
  }

  async function toggleRead (book) {
    try {
      const res = await fetch(`${API}/${book._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: book.status === 'read' ? 'unread' : 'read'
        })
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setBooks(old => old.map(b => (b._id === book._id ? updated : b)))
    } catch {
      setError('Could not update book status.')
    }
  }

  async function deleteBook (id) {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setBooks(old => old.filter(b => b._id !== id))
    } catch {
      setError('Could not delete book.')
    }
  }

  const filtered = books.filter(b =>
    `${b.title} ${b.author}`.toLowerCase().includes(search.toLowerCase())
  )

  const readCount = books.filter(b => b.status === 'read').length

  return (
    <main className='min-h-screen bg-slate-50 text-slate-800'>
      <header className='bg-indigo-700 text-white'>
        <div className='mx-auto flex max-w-6xl items-center justify-between px-5 py-5'>
          <h1 className='text-2xl font-extrabold'>📚 BookShelf</h1>
          <span className='rounded-full bg-white/15 px-4 py-2 text-sm'>
            My Reading Space
          </span>
        </div>
      </header>

      <section className='mx-auto max-w-6xl px-5 py-10'>
        <div className='mb-8'>
          <p className='mb-2 font-semibold text-indigo-600'>
            YOUR PERSONAL LIBRARY
          </p>
          <h2 className='text-3xl font-extrabold sm:text-4xl'>
            Every book has a story.
          </h2>
          <p className='mt-3 text-slate-500'>
            Organize your books and keep track of your reading journey.
          </p>
        </div>

        <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='rounded-2xl bg-white p-5 shadow-sm'>
            <p className='text-sm text-slate-500'>Total Books</p>
            <p className='mt-2 text-3xl font-bold'>{books.length}</p>
          </div>
          <div className='rounded-2xl bg-white p-5 shadow-sm'>
            <p className='text-sm text-slate-500'>Books Read</p>
            <p className='mt-2 text-3xl font-bold text-emerald-600'>
              {readCount}
            </p>
          </div>
          <div className='rounded-2xl bg-white p-5 shadow-sm'>
            <p className='text-sm text-slate-500'>To Read</p>
            <p className='mt-2 text-3xl font-bold text-amber-600'>
              {books.length - readCount}
            </p>
          </div>
        </div>

        {error && (
          <p
            role='alert'
            className='mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800'
          >
            {error}
          </p>
        )}

        <div className='grid items-start gap-7 lg:grid-cols-[340px_1fr]'>
          <form
            onSubmit={addBook}
            className='rounded-2xl bg-white p-6 shadow-sm'
          >
            <h3 className='mb-5 text-xl font-bold'>＋ Add a New Book</h3>
            <label className='mb-2 block text-sm font-medium'>Book Title</label>
            <input
              className='mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500'
              placeholder='Enter book title'
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <label className='mb-2 block text-sm font-medium'>
              Author Name
            </label>
            <input
              className='mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500'
              placeholder='Enter author name'
              value={author}
              onChange={e => setAuthor(e.target.value)}
              required
            />
            <button
              disabled={loading}
              className='w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60'
            >
              {loading ? 'Adding...' : 'Add Book'}
            </button>
          </form>

          <section className='rounded-2xl bg-white p-6 shadow-sm'>
            <div className='mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
              <div>
                <h3 className='text-xl font-bold'>My Books</h3>
                <p className='mt-1 text-sm text-slate-500'>
                  {filtered.length} book(s) in your list
                </p>
              </div>
              <input
                className='rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500'
                placeholder='Search books...'
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div className='rounded-xl border-2 border-dashed border-slate-200 p-10 text-center'>
                <p className='text-4xl'>📖</p>
                <p className='mt-3 font-semibold'>No books found</p>
                <p className='mt-1 text-sm text-slate-500'>
                  Add a book using the form.
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {filtered.map(book => (
                  <article
                    key={book._id}
                    className='flex flex-col justify-between gap-4 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl'>
                        📘
                      </div>
                      <div>
                        <h4
                          className={`font-bold ${
                            book.status === 'read'
                              ? 'text-slate-400 line-through'
                              : ''
                          }`}
                        >
                          {book.title}
                        </h4>
                        <p className='mt-1 text-sm text-slate-500'>
                          by {book.author}
                        </p>
                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            book.status === 'read'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {book.status === 'read' ? '✓ Read' : 'Not Read'}
                        </span>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        type='button'
                        onClick={() => toggleRead(book)}
                        className='rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100'
                      >
                        {book.status === 'read' ? 'Unread' : 'Mark Read'}
                      </button>
                      <button
                        type='button'
                        onClick={() => deleteBook(book._id)}
                        className='rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100'
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
      <footer className='mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-500'>
        BookShelf Manager · Built with React, Tailwind CSS & MongoDB
      </footer>
    </main>
  )
}
