import { useMemo } from 'react';

export type TemplateValueMapper<ItemT, ValueT> = (item: ItemT) => ValueT;

export class TemplateValue<ValueT> {
  _mapper: TemplateValueMapper<any, ValueT>;

  constructor(mapper: TemplateValueMapper<any, ValueT>) {
    this._mapper = mapper;
  }

  getMapper() {
    return this._mapper;
  }
}

export function useTemplateValue<ItemT, ValueT>(
  mapper: TemplateValueMapper<ItemT, ValueT>,
): TemplateValue<ValueT> {
  return useMemo(() => {
    return new TemplateValue(mapper);
  }, [mapper]);
}
