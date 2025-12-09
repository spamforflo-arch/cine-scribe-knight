export interface Film {
  id: string;
  title: string;
  year: number;
  poster: string;
  backdrop?: string;
  synopsis: string;
  director: string;
  cast: string[];
  genres: string[];
  runtime: number;
  rating: number;
  reviewCount: number;
}

export interface DiaryEntry {
  id: string;
  filmId: string;
  date: string;
  rating?: number;
  review?: string;
  liked: boolean;
  rewatch: boolean;
}

export interface Review {
  id: string;
  filmId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  date: string;
  likes: number;
}

export interface UserList {
  id: string;
  name: string;
  description: string;
  filmIds: string[];
  createdBy: string;
  createdAt: string;
  likes: number;
}

export const films: Film[] = [
  {
    id: "1",
    title: "Oppenheimer",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    synopsis: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    genres: ["Biography", "Drama", "History"],
    runtime: 180,
    rating: 4.3,
    reviewCount: 15420,
  },
  {
    id: "2",
    title: "Poor Things",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/bQS43HSLZzMjZkcHJz4fGc7fNdz.jpg",
    synopsis: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
    director: "Yorgos Lanthimos",
    cast: ["Emma Stone", "Mark Ruffalo", "Willem Dafoe"],
    genres: ["Comedy", "Drama", "Romance"],
    runtime: 141,
    rating: 4.1,
    reviewCount: 8320,
  },
  {
    id: "3",
    title: "Dune: Part Two",
    year: 2024,
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Austin Butler"],
    genres: ["Action", "Adventure", "Drama"],
    runtime: 166,
    rating: 4.5,
    reviewCount: 12500,
  },
  {
    id: "4",
    title: "The Holdovers",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdac.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/5Hfar2kJB1lyJ5JVuLQDEy7Zu6J.jpg",
    synopsis: "A curmudgeonly instructor at a New England prep school is forced to remain on campus during Christmas break to babysit the handful of students with nowhere to go.",
    director: "Alexander Payne",
    cast: ["Paul Giamatti", "Da'Vine Joy Randolph", "Dominic Sessa"],
    genres: ["Comedy", "Drama"],
    runtime: 133,
    rating: 4.2,
    reviewCount: 5640,
  },
  {
    id: "5",
    title: "Past Lives",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/hU2hf6HS9fJlhKPhRlYHsGvuCjk.jpg",
    synopsis: "Nora and Hae Sung, two deeply connected childhood friends, are wrest apart after Nora's family emigrates from South Korea.",
    director: "Celine Song",
    cast: ["Greta Lee", "Teo Yoo", "John Magaro"],
    genres: ["Drama", "Romance"],
    runtime: 105,
    rating: 4.4,
    reviewCount: 7890,
  },
  {
    id: "6",
    title: "Killers of the Flower Moon",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/7yyFEsuaLGTPul5UkHc5BhXnQ0k.jpg",
    synopsis: "Members of the Osage tribe in the United States are murdered under mysterious circumstances in the 1920s, sparking a major FBI investigation.",
    director: "Martin Scorsese",
    cast: ["Leonardo DiCaprio", "Robert De Niro", "Lily Gladstone"],
    genres: ["Crime", "Drama", "History"],
    runtime: 206,
    rating: 4.0,
    reviewCount: 9210,
  },
  {
    id: "7",
    title: "Anatomy of a Fall",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w500/kQs6keheMwCxJxrzV83VUwFtHkB.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/96RT2A47UdzWlUfTIoZntzT1gRg.jpg",
    synopsis: "A woman is suspected of her husband's murder, and their blind son faces a moral dilemma as the sole witness.",
    director: "Justine Triet",
    cast: ["Sandra Hüller", "Swann Arlaud", "Milo Machado Graner"],
    genres: ["Crime", "Drama", "Thriller"],
    runtime: 151,
    rating: 4.3,
    reviewCount: 6540,
  },
  {
    id: "8",
    title: "The Zone of Interest",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w500/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/waMO3mYTSVw4DCAhvIrjS7V0lW6.jpg",
    synopsis: "The commandant of Auschwitz, Rudolf Höss, and his wife Hedwig, strive to build a dream life for their family in a house and garden next to the camp.",
    director: "Jonathan Glazer",
    cast: ["Christian Friedel", "Sandra Hüller"],
    genres: ["Drama", "History", "War"],
    runtime: 105,
    rating: 4.1,
    reviewCount: 4320,
  },
];

export const diaryEntries: DiaryEntry[] = [
  { id: "1", filmId: "3", date: "2024-03-15", rating: 5, review: "An absolute masterpiece. Villeneuve outdid himself.", liked: true, rewatch: false },
  { id: "2", filmId: "1", date: "2024-03-10", rating: 4.5, liked: true, rewatch: false },
  { id: "3", filmId: "5", date: "2024-03-05", rating: 4.5, review: "Beautifully understated. The final scene broke me.", liked: true, rewatch: false },
  { id: "4", filmId: "2", date: "2024-02-28", rating: 4, liked: true, rewatch: false },
  { id: "5", filmId: "4", date: "2024-02-20", rating: 4, liked: false, rewatch: false },
  { id: "6", filmId: "6", date: "2024-02-15", rating: 4, review: "Scorsese's epic storytelling at its finest.", liked: true, rewatch: false },
];

export const reviews: Review[] = [
  {
    id: "1",
    filmId: "3",
    userId: "1",
    userName: "CinematicDreamer",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    content: "Denis Villeneuve has crafted something truly extraordinary here. The way he balances the intimate character moments with the grand spectacle is masterful. Chalamet and Zendaya's chemistry is electric.",
    date: "2024-03-16",
    likes: 234,
  },
  {
    id: "2",
    filmId: "1",
    userId: "2",
    userName: "FilmNerd42",
    userAvatar: "https://i.pravatar.cc/150?img=2",
    rating: 4.5,
    content: "Nolan delivers a haunting meditation on genius, guilt, and the weight of history. Cillian Murphy's performance is nothing short of transcendent.",
    date: "2024-03-12",
    likes: 189,
  },
  {
    id: "3",
    filmId: "5",
    userId: "3",
    userName: "MidnightScreenings",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    rating: 5,
    content: "Past Lives is the kind of film that stays with you for days. Celine Song's debut is achingly beautiful - a meditation on fate, choices, and the lives we don't live.",
    date: "2024-03-08",
    likes: 156,
  },
];

export const userLists: UserList[] = [
  {
    id: "1",
    name: "2024 Oscar Contenders",
    description: "The best films competing for Academy recognition this year",
    filmIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    createdBy: "CinematicDreamer",
    createdAt: "2024-01-15",
    likes: 1240,
  },
  {
    id: "2",
    name: "Visually Stunning Masterpieces",
    description: "Films that push the boundaries of cinematography",
    filmIds: ["3", "1", "6"],
    createdBy: "FilmNerd42",
    createdAt: "2024-02-20",
    likes: 876,
  },
];

export const getFilmById = (id: string): Film | undefined => {
  return films.find(film => film.id === id);
};

export const getReviewsByFilmId = (filmId: string): Review[] => {
  return reviews.filter(review => review.filmId === filmId);
};
