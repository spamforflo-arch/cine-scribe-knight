import { useState } from "react";
import { Film, Tv, Sparkles, ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FilmCard } from "@/components/films/FilmCard";
import { cn } from "@/lib/utils";

const categories = [
  { id: "films", label: "Films", icon: Film },
  { id: "tv", label: "TV Shows", icon: Tv },
  { id: "anime", label: "Anime", icon: Sparkles },
];

const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Horror", 
  "Romance", "Sci-Fi", "Thriller", "Fantasy", "Animation",
  "Mystery", "Crime", "Documentary"
];

// Sample data for each category and genre
const contentData: Record<string, Record<string, Array<{
  id: string;
  title: string;
  year: number;
  poster: string;
  rating: number;
  genres: string[];
  synopsis: string;
  director: string;
  cast: string[];
  runtime: number;
  reviewCount: number;
}>>> = {
  films: {
    Action: [
      { id: "f1", title: "Mad Max: Fury Road", year: 2015, poster: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", rating: 4.5, genres: ["Action"], synopsis: "A woman rebels against a tyrannical ruler.", director: "George Miller", cast: ["Tom Hardy", "Charlize Theron"], runtime: 120, reviewCount: 5000 },
      { id: "f2", title: "John Wick", year: 2014, poster: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg", rating: 4.3, genres: ["Action"], synopsis: "An ex-hitman comes out of retirement.", director: "Chad Stahelski", cast: ["Keanu Reeves"], runtime: 101, reviewCount: 4500 },
      { id: "f3", title: "The Dark Knight", year: 2008, poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", rating: 4.8, genres: ["Action"], synopsis: "Batman faces the Joker.", director: "Christopher Nolan", cast: ["Christian Bale", "Heath Ledger"], runtime: 152, reviewCount: 8000 },
      { id: "f4", title: "Gladiator", year: 2000, poster: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg", rating: 4.6, genres: ["Action"], synopsis: "A betrayed Roman general seeks revenge.", director: "Ridley Scott", cast: ["Russell Crowe"], runtime: 155, reviewCount: 6000 },
    ],
    Comedy: [
      { id: "f5", title: "Superbad", year: 2007, poster: "https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg", rating: 4.1, genres: ["Comedy"], synopsis: "Two friends try to party before graduation.", director: "Greg Mottola", cast: ["Jonah Hill", "Michael Cera"], runtime: 113, reviewCount: 3000 },
      { id: "f6", title: "The Hangover", year: 2009, poster: "https://image.tmdb.org/t/p/w500/uluhlXubGu1VxU63X9VHCLWDAYP.jpg", rating: 4.0, genres: ["Comedy"], synopsis: "Friends try to find a missing groom.", director: "Todd Phillips", cast: ["Bradley Cooper", "Zach Galifianakis"], runtime: 100, reviewCount: 4000 },
    ],
    Drama: [
      { id: "f7", title: "The Shawshank Redemption", year: 1994, poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", rating: 4.9, genres: ["Drama"], synopsis: "Two imprisoned men bond over years.", director: "Frank Darabont", cast: ["Tim Robbins", "Morgan Freeman"], runtime: 142, reviewCount: 10000 },
      { id: "f8", title: "Forrest Gump", year: 1994, poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", rating: 4.7, genres: ["Drama"], synopsis: "A man with low IQ achieves great things.", director: "Robert Zemeckis", cast: ["Tom Hanks"], runtime: 142, reviewCount: 8000 },
    ],
    Horror: [
      { id: "f9", title: "Get Out", year: 2017, poster: "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg", rating: 4.4, genres: ["Horror"], synopsis: "A young man uncovers a disturbing secret.", director: "Jordan Peele", cast: ["Daniel Kaluuya"], runtime: 104, reviewCount: 5000 },
      { id: "f10", title: "The Conjuring", year: 2013, poster: "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg", rating: 4.2, genres: ["Horror"], synopsis: "Paranormal investigators help a family.", director: "James Wan", cast: ["Vera Farmiga", "Patrick Wilson"], runtime: 112, reviewCount: 4000 },
    ],
    "Sci-Fi": [
      { id: "f11", title: "Interstellar", year: 2014, poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", rating: 4.7, genres: ["Sci-Fi"], synopsis: "Explorers travel through a wormhole.", director: "Christopher Nolan", cast: ["Matthew McConaughey"], runtime: 169, reviewCount: 7000 },
      { id: "f12", title: "Inception", year: 2010, poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", rating: 4.6, genres: ["Sci-Fi"], synopsis: "A thief steals corporate secrets through dreams.", director: "Christopher Nolan", cast: ["Leonardo DiCaprio"], runtime: 148, reviewCount: 8000 },
      { id: "f13", title: "The Matrix", year: 1999, poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", rating: 4.5, genres: ["Sci-Fi"], synopsis: "A hacker discovers reality is a simulation.", director: "The Wachowskis", cast: ["Keanu Reeves"], runtime: 136, reviewCount: 7500 },
    ],
    Romance: [
      { id: "f14", title: "The Notebook", year: 2004, poster: "https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg", rating: 4.2, genres: ["Romance"], synopsis: "A poor young man falls for a rich woman.", director: "Nick Cassavetes", cast: ["Ryan Gosling", "Rachel McAdams"], runtime: 123, reviewCount: 5000 },
      { id: "f15", title: "La La Land", year: 2016, poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg", rating: 4.4, genres: ["Romance"], synopsis: "A musician and actress fall in love in LA.", director: "Damien Chazelle", cast: ["Ryan Gosling", "Emma Stone"], runtime: 128, reviewCount: 6000 },
    ],
    Thriller: [
      { id: "f16", title: "Gone Girl", year: 2014, poster: "https://image.tmdb.org/t/p/w500/lv5xShBIDPe7m4ufdTDhrcOdMqJ.jpg", rating: 4.3, genres: ["Thriller"], synopsis: "A man's wife mysteriously disappears.", director: "David Fincher", cast: ["Ben Affleck", "Rosamund Pike"], runtime: 149, reviewCount: 5500 },
      { id: "f17", title: "Se7en", year: 1995, poster: "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg", rating: 4.5, genres: ["Thriller"], synopsis: "Detectives hunt a serial killer.", director: "David Fincher", cast: ["Brad Pitt", "Morgan Freeman"], runtime: 127, reviewCount: 6000 },
    ],
    Fantasy: [
      { id: "f18", title: "The Lord of the Rings: Fellowship", year: 2001, poster: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", rating: 4.8, genres: ["Fantasy"], synopsis: "A hobbit must destroy a powerful ring.", director: "Peter Jackson", cast: ["Elijah Wood", "Ian McKellen"], runtime: 178, reviewCount: 9000 },
      { id: "f19", title: "Harry Potter: Sorcerer's Stone", year: 2001, poster: "https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg", rating: 4.3, genres: ["Fantasy"], synopsis: "A boy discovers he's a wizard.", director: "Chris Columbus", cast: ["Daniel Radcliffe"], runtime: 152, reviewCount: 7000 },
    ],
    Animation: [
      { id: "f20", title: "Spider-Man: Into the Spider-Verse", year: 2018, poster: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", rating: 4.7, genres: ["Animation"], synopsis: "Miles Morales becomes Spider-Man.", director: "Peter Ramsey", cast: ["Shameik Moore"], runtime: 117, reviewCount: 6000 },
      { id: "f21", title: "Coco", year: 2017, poster: "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg", rating: 4.6, genres: ["Animation"], synopsis: "A boy journeys to the Land of the Dead.", director: "Lee Unkrich", cast: ["Anthony Gonzalez"], runtime: 105, reviewCount: 5500 },
    ],
    Mystery: [
      { id: "f22", title: "Knives Out", year: 2019, poster: "https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg", rating: 4.4, genres: ["Mystery"], synopsis: "A detective investigates a family patriarch's death.", director: "Rian Johnson", cast: ["Daniel Craig", "Ana de Armas"], runtime: 130, reviewCount: 5000 },
    ],
    Crime: [
      { id: "f23", title: "Pulp Fiction", year: 1994, poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", rating: 4.6, genres: ["Crime"], synopsis: "Interconnected stories of criminals.", director: "Quentin Tarantino", cast: ["John Travolta", "Samuel L. Jackson"], runtime: 154, reviewCount: 7000 },
      { id: "f24", title: "The Godfather", year: 1972, poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", rating: 4.9, genres: ["Crime"], synopsis: "The aging patriarch of a crime dynasty.", director: "Francis Ford Coppola", cast: ["Marlon Brando", "Al Pacino"], runtime: 175, reviewCount: 9000 },
    ],
    Documentary: [
      { id: "f25", title: "Free Solo", year: 2018, poster: "https://image.tmdb.org/t/p/w500/v4QfYZMACODlWul9doN9RxE94se.jpg", rating: 4.5, genres: ["Documentary"], synopsis: "A climber attempts El Capitan without ropes.", director: "Elizabeth Chai Vasarhelyi", cast: ["Alex Honnold"], runtime: 100, reviewCount: 3000 },
    ],
    Adventure: [
      { id: "f26", title: "Indiana Jones: Raiders", year: 1981, poster: "https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc3AHRys.jpg", rating: 4.6, genres: ["Adventure"], synopsis: "An archaeologist searches for the Ark.", director: "Steven Spielberg", cast: ["Harrison Ford"], runtime: 115, reviewCount: 6000 },
      { id: "f27", title: "Jurassic Park", year: 1993, poster: "https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg", rating: 4.4, genres: ["Adventure"], synopsis: "Cloned dinosaurs run amok at a theme park.", director: "Steven Spielberg", cast: ["Sam Neill", "Laura Dern"], runtime: 127, reviewCount: 7000 },
    ],
  },
  tv: {
    Action: [
      { id: "t1", title: "The Boys", year: 2019, poster: "https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg", rating: 4.5, genres: ["Action"], synopsis: "Vigilantes fight corrupt superheroes.", director: "Eric Kripke", cast: ["Karl Urban"], runtime: 60, reviewCount: 5000 },
      { id: "t2", title: "Peaky Blinders", year: 2013, poster: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg", rating: 4.6, genres: ["Action"], synopsis: "A crime family in 1920s England.", director: "Steven Knight", cast: ["Cillian Murphy"], runtime: 60, reviewCount: 6000 },
    ],
    Comedy: [
      { id: "t3", title: "The Office", year: 2005, poster: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg", rating: 4.7, genres: ["Comedy"], synopsis: "A mockumentary on office workers.", director: "Greg Daniels", cast: ["Steve Carell"], runtime: 22, reviewCount: 8000 },
      { id: "t4", title: "Brooklyn Nine-Nine", year: 2013, poster: "https://image.tmdb.org/t/p/w500/hgRMSOt7a1b8qyQR68vUixJPang.jpg", rating: 4.4, genres: ["Comedy"], synopsis: "Detectives solve crimes hilariously.", director: "Michael Schur", cast: ["Andy Samberg"], runtime: 22, reviewCount: 5000 },
    ],
    Drama: [
      { id: "t5", title: "Breaking Bad", year: 2008, poster: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", rating: 4.9, genres: ["Drama"], synopsis: "A teacher turns to cooking meth.", director: "Vince Gilligan", cast: ["Bryan Cranston"], runtime: 47, reviewCount: 10000 },
      { id: "t6", title: "Game of Thrones", year: 2011, poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg", rating: 4.5, genres: ["Drama"], synopsis: "Noble families fight for the Iron Throne.", director: "David Benioff", cast: ["Emilia Clarke", "Kit Harington"], runtime: 57, reviewCount: 9000 },
      { id: "t7", title: "The Sopranos", year: 1999, poster: "https://image.tmdb.org/t/p/w500/57okJJUBK0AaijxLh3RjNUaMvFI.jpg", rating: 4.8, genres: ["Drama"], synopsis: "A mob boss struggles with family and business.", director: "David Chase", cast: ["James Gandolfini"], runtime: 55, reviewCount: 7000 },
    ],
    Horror: [
      { id: "t8", title: "Stranger Things", year: 2016, poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", rating: 4.5, genres: ["Horror"], synopsis: "Kids uncover supernatural mysteries.", director: "The Duffer Brothers", cast: ["Millie Bobby Brown"], runtime: 51, reviewCount: 8000 },
      { id: "t9", title: "The Haunting of Hill House", year: 2018, poster: "https://image.tmdb.org/t/p/w500/xrAaJANdKvvkAHiXHfIzUyKG8zu.jpg", rating: 4.4, genres: ["Horror"], synopsis: "Siblings confront haunting memories.", director: "Mike Flanagan", cast: ["Michiel Huisman"], runtime: 55, reviewCount: 4000 },
    ],
    "Sci-Fi": [
      { id: "t10", title: "Black Mirror", year: 2011, poster: "https://image.tmdb.org/t/p/w500/7PRddO7z7mcPi21nMTXMQSvZFKE.jpg", rating: 4.5, genres: ["Sci-Fi"], synopsis: "Dark tales about technology's impact.", director: "Charlie Brooker", cast: ["Various"], runtime: 60, reviewCount: 6000 },
      { id: "t11", title: "Westworld", year: 2016, poster: "https://image.tmdb.org/t/p/w500/8MfgyFHf7XEboZJPZXCIDqqiz6e.jpg", rating: 4.3, genres: ["Sci-Fi"], synopsis: "A futuristic theme park with AI hosts.", director: "Jonathan Nolan", cast: ["Evan Rachel Wood"], runtime: 62, reviewCount: 5000 },
    ],
    Romance: [
      { id: "t12", title: "Normal People", year: 2020, poster: "https://image.tmdb.org/t/p/w500/tKjddPWGnsDscpJ1tAFvvgbQMrT.jpg", rating: 4.3, genres: ["Romance"], synopsis: "Two Irish teens navigate love.", director: "Lenny Abrahamson", cast: ["Daisy Edgar-Jones", "Paul Mescal"], runtime: 30, reviewCount: 3000 },
    ],
    Thriller: [
      { id: "t13", title: "Mindhunter", year: 2017, poster: "https://image.tmdb.org/t/p/w500/7LMpKQU4Q7sfvT9xNpZlnP6MLEM.jpg", rating: 4.6, genres: ["Thriller"], synopsis: "FBI agents interview serial killers.", director: "David Fincher", cast: ["Jonathan Groff"], runtime: 60, reviewCount: 4500 },
      { id: "t14", title: "True Detective", year: 2014, poster: "https://image.tmdb.org/t/p/w500/aowr8ISBNiUKFdMIlNUWL9uFkLF.jpg", rating: 4.5, genres: ["Thriller"], synopsis: "Detectives hunt a serial killer.", director: "Nic Pizzolatto", cast: ["Matthew McConaughey", "Woody Harrelson"], runtime: 55, reviewCount: 5000 },
    ],
    Fantasy: [
      { id: "t15", title: "The Witcher", year: 2019, poster: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg", rating: 4.2, genres: ["Fantasy"], synopsis: "A monster hunter navigates a dangerous world.", director: "Lauren Schmidt Hissrich", cast: ["Henry Cavill"], runtime: 60, reviewCount: 5000 },
      { id: "t16", title: "House of the Dragon", year: 2022, poster: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg", rating: 4.4, genres: ["Fantasy"], synopsis: "The Targaryen civil war.", director: "Ryan Condal", cast: ["Matt Smith", "Emma D'Arcy"], runtime: 60, reviewCount: 4500 },
    ],
    Animation: [
      { id: "t17", title: "Arcane", year: 2021, poster: "https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg", rating: 4.8, genres: ["Animation"], synopsis: "Sisters in a city divided by magic.", director: "Pascal Charrue", cast: ["Hailee Steinfeld"], runtime: 41, reviewCount: 5000 },
      { id: "t18", title: "Rick and Morty", year: 2013, poster: "https://image.tmdb.org/t/p/w500/cvhNj9eoRBe5SxjCbQTkh05UP5K.jpg", rating: 4.5, genres: ["Animation"], synopsis: "A genius grandpa and his grandson.", director: "Justin Roiland", cast: ["Justin Roiland"], runtime: 23, reviewCount: 6000 },
    ],
    Mystery: [
      { id: "t19", title: "Dark", year: 2017, poster: "https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg", rating: 4.7, genres: ["Mystery"], synopsis: "Children disappear, revealing a time conspiracy.", director: "Baran bo Odar", cast: ["Louis Hofmann"], runtime: 60, reviewCount: 4000 },
    ],
    Crime: [
      { id: "t20", title: "Ozark", year: 2017, poster: "https://image.tmdb.org/t/p/w500/pCGyPVrI9Fzw6XIrmiquOjjhtVD.jpg", rating: 4.5, genres: ["Crime"], synopsis: "A financial planner launders money.", director: "Bill Dubuque", cast: ["Jason Bateman"], runtime: 60, reviewCount: 5000 },
      { id: "t21", title: "Better Call Saul", year: 2015, poster: "https://image.tmdb.org/t/p/w500/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg", rating: 4.7, genres: ["Crime"], synopsis: "A lawyer's transformation into Saul Goodman.", director: "Vince Gilligan", cast: ["Bob Odenkirk"], runtime: 46, reviewCount: 6000 },
    ],
    Documentary: [
      { id: "t22", title: "Planet Earth II", year: 2016, poster: "https://image.tmdb.org/t/p/w500/6rXqZmPBBGzPZh5p5NOlHkQlLy3.jpg", rating: 4.9, genres: ["Documentary"], synopsis: "A stunning look at Earth's habitats.", director: "David Attenborough", cast: ["David Attenborough"], runtime: 50, reviewCount: 4000 },
    ],
    Adventure: [
      { id: "t23", title: "The Mandalorian", year: 2019, poster: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg", rating: 4.5, genres: ["Adventure"], synopsis: "A bounty hunter protects a child.", director: "Jon Favreau", cast: ["Pedro Pascal"], runtime: 40, reviewCount: 6000 },
    ],
  },
  anime: {
    Action: [
      { id: "a1", title: "Attack on Titan", year: 2013, poster: "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg", rating: 4.8, genres: ["Action"], synopsis: "Humanity fights giant humanoid Titans.", director: "Hajime Isayama", cast: ["Yuki Kaji"], runtime: 24, reviewCount: 9000 },
      { id: "a2", title: "Demon Slayer", year: 2019, poster: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg", rating: 4.7, genres: ["Action"], synopsis: "A boy hunts demons to save his sister.", director: "Koyoharu Gotouge", cast: ["Natsuki Hanae"], runtime: 24, reviewCount: 7000 },
      { id: "a3", title: "Jujutsu Kaisen", year: 2020, poster: "https://image.tmdb.org/t/p/w500/hFWP5HkbVEe40hrXgtCeQxoccHE.jpg", rating: 4.6, genres: ["Action"], synopsis: "A student joins a secret organization fighting curses.", director: "Gege Akutami", cast: ["Junya Enoki"], runtime: 24, reviewCount: 6000 },
      { id: "a4", title: "One Punch Man", year: 2015, poster: "https://image.tmdb.org/t/p/w500/iE3s0lG5QVdEHOEZnoAxjmMtvne.jpg", rating: 4.5, genres: ["Action"], synopsis: "A hero defeats enemies with one punch.", director: "ONE", cast: ["Makoto Furukawa"], runtime: 24, reviewCount: 5500 },
    ],
    Comedy: [
      { id: "a5", title: "Konosuba", year: 2016, poster: "https://image.tmdb.org/t/p/w500/cZvQzNjvxQcpMFyLbMbqXHrXq5X.jpg", rating: 4.3, genres: ["Comedy"], synopsis: "A teen is reborn in a fantasy world.", director: "Natsume Akatsuki", cast: ["Jun Fukushima"], runtime: 24, reviewCount: 3500 },
      { id: "a6", title: "Gintama", year: 2006, poster: "https://image.tmdb.org/t/p/w500/sZsJQu2GMerDfklhzXwwIo4Oqka.jpg", rating: 4.7, genres: ["Comedy"], synopsis: "A samurai in an alien-invaded Edo.", director: "Hideaki Sorachi", cast: ["Tomokazu Sugita"], runtime: 24, reviewCount: 5000 },
    ],
    Drama: [
      { id: "a7", title: "Your Lie in April", year: 2014, poster: "https://image.tmdb.org/t/p/w500/nkDLaLLJdqxvMBl3483rvxRxXv.jpg", rating: 4.6, genres: ["Drama"], synopsis: "A pianist meets a free-spirited violinist.", director: "Naoshi Arakawa", cast: ["Natsuki Hanae"], runtime: 22, reviewCount: 5000 },
      { id: "a8", title: "Violet Evergarden", year: 2018, poster: "https://image.tmdb.org/t/p/w500/ImvHbM4GsJJykarnOzhtpG6ax6.jpg", rating: 4.7, genres: ["Drama"], synopsis: "A former soldier becomes a letter writer.", director: "Taichi Ishidate", cast: ["Yui Ishikawa"], runtime: 24, reviewCount: 4500 },
      { id: "a9", title: "Steins;Gate", year: 2011, poster: "https://image.tmdb.org/t/p/w500/nWqJXffgC2FXNS9TxlQz7IpIWSP.jpg", rating: 4.8, genres: ["Drama"], synopsis: "Scientists discover time travel via microwave.", director: "Hiroshi Hamasaki", cast: ["Mamoru Miyano"], runtime: 24, reviewCount: 6000 },
    ],
    Horror: [
      { id: "a10", title: "Tokyo Ghoul", year: 2014, poster: "https://image.tmdb.org/t/p/w500/f9mSDgQCunH5gHXaOBn3znBJDK6.jpg", rating: 4.2, genres: ["Horror"], synopsis: "A student becomes half-ghoul.", director: "Sui Ishida", cast: ["Natsuki Hanae"], runtime: 24, reviewCount: 4000 },
      { id: "a11", title: "Parasyte", year: 2014, poster: "https://image.tmdb.org/t/p/w500/f2vGFY96RaVnGweL4vjU9WBf2Ux.jpg", rating: 4.4, genres: ["Horror"], synopsis: "Aliens invade human bodies.", director: "Hitoshi Iwaaki", cast: ["Nobunaga Shimazaki"], runtime: 22, reviewCount: 3500 },
    ],
    "Sci-Fi": [
      { id: "a12", title: "Cowboy Bebop", year: 1998, poster: "https://image.tmdb.org/t/p/w500/hyoqyzaq8DjFCpzE7VkJbLFhA2G.jpg", rating: 4.7, genres: ["Sci-Fi"], synopsis: "Bounty hunters in space.", director: "Shinichiro Watanabe", cast: ["Koichi Yamadera"], runtime: 24, reviewCount: 5500 },
      { id: "a13", title: "Neon Genesis Evangelion", year: 1995, poster: "https://image.tmdb.org/t/p/w500/wkzskoqMvSggVHSKzlP3WEz2CZf.jpg", rating: 4.5, genres: ["Sci-Fi"], synopsis: "Teens pilot mechs against Angels.", director: "Hideaki Anno", cast: ["Megumi Ogata"], runtime: 24, reviewCount: 6000 },
      { id: "a14", title: "Psycho-Pass", year: 2012, poster: "https://image.tmdb.org/t/p/w500/vKozSq6ZJdkT9JzGdLYSToqyTJF.jpg", rating: 4.4, genres: ["Sci-Fi"], synopsis: "A dystopia where crime is predicted.", director: "Naoyoshi Shiotani", cast: ["Kana Hanazawa"], runtime: 25, reviewCount: 4000 },
    ],
    Romance: [
      { id: "a15", title: "Your Name", year: 2016, poster: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg", rating: 4.8, genres: ["Romance"], synopsis: "Two strangers swap bodies mysteriously.", director: "Makoto Shinkai", cast: ["Ryunosuke Kamiki"], runtime: 107, reviewCount: 8000 },
      { id: "a16", title: "Toradora!", year: 2008, poster: "https://image.tmdb.org/t/p/w500/oMXQJ4xMXrhcLVjL5ckGPYzMVmW.jpg", rating: 4.4, genres: ["Romance"], synopsis: "Two unlikely friends help each other's crushes.", director: "Tatsuyuki Nagai", cast: ["Junji Majima"], runtime: 24, reviewCount: 4500 },
    ],
    Thriller: [
      { id: "a17", title: "Death Note", year: 2006, poster: "https://image.tmdb.org/t/p/w500/g8hPCJYQonmcLt5fDJFaBlSYwB.jpg", rating: 4.7, genres: ["Thriller"], synopsis: "A student finds a notebook that kills.", director: "Tsugumi Ohba", cast: ["Mamoru Miyano"], runtime: 23, reviewCount: 7000 },
      { id: "a18", title: "Monster", year: 2004, poster: "https://image.tmdb.org/t/p/w500/uMDz6nVVy2wKokmK3n6xbOEt0KF.jpg", rating: 4.6, genres: ["Thriller"], synopsis: "A doctor hunts a serial killer he saved.", director: "Masayuki Kojima", cast: ["Hidenobu Kiuchi"], runtime: 24, reviewCount: 4000 },
    ],
    Fantasy: [
      { id: "a19", title: "Fullmetal Alchemist: Brotherhood", year: 2009, poster: "https://image.tmdb.org/t/p/w500/orDyPOEihfCSfJrLAmNOLdL2TfP.jpg", rating: 4.9, genres: ["Fantasy"], synopsis: "Brothers use alchemy to restore their bodies.", director: "Hiromu Arakawa", cast: ["Romi Park"], runtime: 24, reviewCount: 9000 },
      { id: "a20", title: "Made in Abyss", year: 2017, poster: "https://image.tmdb.org/t/p/w500/uVK3H8CgtrVgySFpdImvNXkN7RK.jpg", rating: 4.5, genres: ["Fantasy"], synopsis: "A girl descends into a mysterious chasm.", director: "Masayuki Kojima", cast: ["Miyu Tomita"], runtime: 25, reviewCount: 3500 },
      { id: "a21", title: "Spirited Away", year: 2001, poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", rating: 4.8, genres: ["Fantasy"], synopsis: "A girl enters a world of spirits.", director: "Hayao Miyazaki", cast: ["Rumi Hiiragi"], runtime: 125, reviewCount: 8000 },
    ],
    Animation: [
      { id: "a22", title: "Mob Psycho 100", year: 2016, poster: "https://image.tmdb.org/t/p/w500/vJqlo48Lp1v5t1SHKxCo8hqeRqr.jpg", rating: 4.6, genres: ["Animation"], synopsis: "A psychic boy tries to live normally.", director: "ONE", cast: ["Setsuo Ito"], runtime: 24, reviewCount: 4500 },
    ],
    Mystery: [
      { id: "a23", title: "Erased", year: 2016, poster: "https://image.tmdb.org/t/p/w500/rKd8k3cONYNJSZcWJT4oQhGnZ6n.jpg", rating: 4.5, genres: ["Mystery"], synopsis: "A man travels back to prevent murders.", director: "Kei Sanbe", cast: ["Shinnosuke Mitsushima"], runtime: 23, reviewCount: 4000 },
      { id: "a24", title: "The Promised Neverland", year: 2019, poster: "https://image.tmdb.org/t/p/w500/oBgRCpAbtMpk1v8wfdsIph7lPQE.jpg", rating: 4.5, genres: ["Mystery"], synopsis: "Orphans discover a dark secret.", director: "Kaiu Shirai", cast: ["Sumire Morohoshi"], runtime: 23, reviewCount: 4500 },
    ],
    Crime: [
      { id: "a25", title: "91 Days", year: 2016, poster: "https://image.tmdb.org/t/p/w500/7qFJHQKp75e3DZLNxHWrxFGvXdq.jpg", rating: 4.2, genres: ["Crime"], synopsis: "A man seeks revenge during Prohibition.", director: "Hiro Kaburaki", cast: ["Takashi Kondo"], runtime: 24, reviewCount: 2500 },
    ],
    Adventure: [
      { id: "a26", title: "One Piece", year: 1999, poster: "https://image.tmdb.org/t/p/w500/e3NBGiAifW9Xt8xD5tpARskjccO.jpg", rating: 4.7, genres: ["Adventure"], synopsis: "A pirate searches for the ultimate treasure.", director: "Eiichiro Oda", cast: ["Mayumi Tanaka"], runtime: 24, reviewCount: 10000 },
      { id: "a27", title: "Hunter x Hunter", year: 2011, poster: "https://image.tmdb.org/t/p/w500/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg", rating: 4.8, genres: ["Adventure"], synopsis: "A boy becomes a Hunter to find his father.", director: "Yoshihiro Togashi", cast: ["Megumi Han"], runtime: 23, reviewCount: 7000 },
    ],
  },
};

const Browse = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const handleBack = () => {
    if (selectedGenre) {
      setSelectedGenre(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const currentContent = selectedCategory && selectedGenre 
    ? contentData[selectedCategory]?.[selectedGenre] || []
    : [];

  return (
    <div className="min-h-screen bg-background grain">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          {(selectedCategory || selectedGenre) && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 click-scale transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {/* Category Selection */}
          {!selectedCategory && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-4">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  What do you want to watch?
                </h1>
                <p className="text-muted-foreground">Choose a category to explore</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
                {categories.map((cat, index) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="group glass rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-peach/50 transition-all duration-300 click-scale animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-peach to-peach-dark flex items-center justify-center shadow-lg shadow-peach/30 group-hover:shadow-peach/50 group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-10 h-10 text-primary-foreground" />
                      </div>
                      <span className="font-display text-xl font-semibold text-foreground group-hover:text-peach transition-colors">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Genre Selection */}
          {selectedCategory && !selectedGenre && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-4">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  Choose a Genre
                </h1>
                <p className="text-muted-foreground">
                  Select a genre to see top {categories.find(c => c.id === selectedCategory)?.label}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mt-12">
                {genres.map((genre, index) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={cn(
                      "px-6 py-3 rounded-full font-medium transition-all duration-300 click-scale animate-scale-in",
                      "bg-secondary text-foreground hover:bg-gradient-to-r hover:from-peach hover:to-peach-dark hover:text-primary-foreground hover:shadow-lg hover:shadow-peach/30"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Grid */}
          {selectedCategory && selectedGenre && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-2">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  Top {selectedGenre} {categories.find(c => c.id === selectedCategory)?.label}
                </h1>
              </div>

              {currentContent.length > 0 ? (
                <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                  {currentContent.map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <FilmCard film={item} size="md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">
                    No content available for this genre yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;
