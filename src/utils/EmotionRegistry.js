"use client";

import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "./createEmotionCache";

const clientSideCache = createEmotionCache();

export default function EmotionRegistry({ children }) {
  return <CacheProvider value={clientSideCache}>{children}</CacheProvider>;
}
