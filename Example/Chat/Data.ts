export type ChatItem = {
  id: number;
  author: string;
  type: 'me' | 'other';
  message: string;
  avatarUrl?: string;
  likes: number;
};

const SampleText = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
It has survived not only five centuries, but also the leap into electronic typesetting, 
remaining essentially unchanged. 
It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`;

const authors = ['John', 'Bob', 'Szymon', 'Marc', 'Elon Musk', 'Me'];

const createChatItem = (index: number): ChatItem => {
  const len = SampleText.length;
  const start = Math.floor(Math.random() * len);
  const messageLen = Math.floor(Math.random() * (len - start - 1)) + 1;
  const message = SampleText.slice(start, start + messageLen)
    .replace('\n', ' ')
    .trim();
  const author = authors[index % authors.length];

  return {
    id: index,
    type: author === 'Me' ? 'me' : 'other',
    author,
    message,
    avatarUrl: `https://i.pravatar.cc/100?u=${
      authors[Math.round(index % authors.length)]
    }`,
    likes: Math.random() > 0.7 ? Math.floor(Math.random() * 8) : 0,
  };
};

export const fetchData = (limit: number = 100) => {
  //   return new Promise<ChatItem[]>(resolve => {
  //     resolve(
  return new Array(limit).fill(0).map((_, index) => createChatItem(index));
  //     );
  //   });
};
