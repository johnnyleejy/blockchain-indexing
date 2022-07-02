import { JSONEventType } from "@eventstore/db-client";

export type BlockInvalidatedEvent = JSONEventType<
  "block-invalidated",
  {
    block: string;
  }
>;