import {useMemo} from 'react';

export type TemplateValueMapper<T, K> = (item: T) => K;

export class TemplateValue<T, K> {
  _mapper: TemplateValueMapper<T, K>;

  constructor(mapper: TemplateValueMapper<T, K>) {
    this._mapper = mapper;
  }

  getMapper() {
    return this._mapper;
  }
}

export function useTemplateValue<T, K>(mapper: TemplateValueMapper<T, K>) {
  return useMemo(() => {
    return new TemplateValue(mapper);
  }, [mapper]) as unknown as K;
}
