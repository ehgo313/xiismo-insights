import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  logo_url?: string | null;
  og_image_url?: string | null;
};

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const { data } = await supabase.from("site_settings").select("key,value");
  const out: SiteSettings = {};
  (data ?? []).forEach((r: any) => { (out as any)[r.key] = r.value; });
  return out;
};

export const useSiteSettings = () => {
  const [s, setS] = useState<SiteSettings>({});
  useEffect(() => {
    fetchSiteSettings().then((settings) => {
      setS(settings);
      if (settings.logo_url) {
        const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (link) link.href = settings.logo_url;
      }
      if (settings.og_image_url) {
        document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute("content", settings.og_image_url);
        document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.setAttribute("content", settings.og_image_url);
      }
    });
  }, []);
  return s;
};

export const saveSiteSetting = async (key: string, value: string | null) => {
  const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
};
