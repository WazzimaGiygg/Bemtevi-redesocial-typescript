import type { Locale } from '../types';

export const translations = {
  'pt-BR': {
    app: {
      name: "Bemtevi",
      title: "Bemtevi - Rede Social",
      beta: "🚧 BETA",
      description: "Uma rede social livre e colaborativa"
    },
    header: {
      brand: "WazzimaGiygg",
      subtitle: "Bemtevi",
      login: "Entrar",
      logout: "Sair",
      profile: "Perfil",
      visitor: "Visitante",
      loading: "Carregando..."
    },
    nav: {
      forYou: "Para Você",
      myPosts: "Minhas Postagens",
      explore: "Explorar",
      communities: "Comunidades",
      messages: "Mensagens",
      createCommunity: "Criar Comunidade",
      saved: "Salvos",
      myProfile: "Meu Perfil"
    },
    feed: {
      title: "📱 Feed",
      myPosts: "Minhas Postagens",
      tabs: {
        forYou: "Para Você",
        latest: "Últimas",
        myPosts: "Minhas"
      },
      empty: "Nenhuma postagem encontrada!",
      loading: "Carregando mais posts...",
      error: "Erro ao carregar posts. Recarregue a página."
    },
    post: {
      placeholder: "O que está acontecendo? (Máx. 127 caracteres)",
      button: "Postar 🚀",
      linkPlaceholder: "🔗 Link (opcional)",
      charCounter: "0/127",
      maxLength: "O texto deve ter no máximo 127 caracteres!",
      empty: "Digite algo para postar!",
      loginRequired: "Faça login para postar!",
      banned: "Sua conta está banida. Não é possível postar.",
      success: "Post publicado com sucesso!",
      error: "Erro ao postar. Tente novamente.",
      deleteConfirm: "Tem certeza que deseja excluir este post?",
      deleteSuccess: "Post excluído com sucesso!",
      deleteError: "Erro ao excluir post.",
      reportPrompt: "Descreva o motivo da denúncia:",
      reportSuccess: "Denúncia enviada! Iremos analisar.",
      reportError: "Erro ao enviar denúncia.",
      shareCopied: "Link copiado para a área de transferência!",
      shareError: "Erro ao copiar link.",
      saved: "Post salvo com sucesso!",
      unsaved: "Post removido dos salvos"
    },
    actions: {
      like: "Curtir",
      unlike: "Descurtir",
      comment: "Comentar",
      share: "Compartilhar",
      save: "Salvar",
      unsave: "Remover dos salvos",
      delete: "Excluir",
      report: "Denunciar",
      follow: "Seguir",
      unfollow: "Deixar de seguir",
      close: "Fechar"
    },
    comments: {
      title: "💬 Comentários",
      placeholder: "Escreva um comentário... (máx. 280 caracteres)",
      button: "Enviar Comentário",
      empty: "Nenhum comentário ainda. Seja o primeiro!",
      loading: "Carregando comentários...",
      error: "Erro ao carregar comentários",
      maxLength: "Comentário muito longo! Máximo 280 caracteres.",
      emptyText: "Digite um comentário!",
      success: "Comentário enviado!",
      errorSend: "Erro ao enviar comentário.",
      loginRequired: "Faça login para comentar!",
      banned: "Sua conta está banida. Não é possível comentar."
    },
    categories: {
      Geral: "Geral",
      Tecnologia: "Tecnologia",
      Ciência: "Ciência",
      Arte: "Arte",
      Música: "Música",
      Esportes: "Esportes",
      Games: "Games",
      Educação: "Educação",
      Política: "Política",
      Entretenimento: "Entretenimento"
    },
    communities: {
      title: "🏛️ Criar Nova Comunidade",
      name: "Nome da Comunidade *",
      namePlaceholder: "Ex: Tecnologia, Música, Games...",
      nameMin: "Mínimo 3 caracteres, máximo 50",
      description: "Descrição",
      descriptionPlaceholder: "Descreva o propósito da comunidade...",
      category: "Categoria",
      button: "🚀 Criar Comunidade",
      success: "Comunidade criada com sucesso!",
      error: "Erro ao criar comunidade",
      loginRequired: "Faça login para criar uma comunidade!",
      nameRequired: "O nome da comunidade deve ter pelo menos 3 caracteres.",
      members: "membros",
      posts: "posts",
      join: "Entrar",
      leave: "Sair",
      joined: "Bem-vindo à comunidade",
      left: "Você saiu da comunidade.",
      notFound: "Comunidade não encontrada."
    },
    trending: {
      title: "🔥 Trending",
      loading: "Carregando...",
      empty: "Nenhum trending no momento",
      error: "Erro ao carregar",
      posts: "posts"
    },
    suggestions: {
      title: "👥 Sugestões",
      loading: "Carregando...",
      empty: "Nenhuma sugestão no momento",
      error: "Erro ao carregar sugestões"
    },
    profile: {
      posts: "Postagens",
      followers: "Seguidores",
      following: "Seguindo",
      karma: "karma",
      bio: "Bio",
      noPosts: "Nenhuma postagem ainda",
      error: "Erro ao carregar perfil"
    },
    login: {
      title: "Entrar no Bemtevi",
      subtitle: "Faça login para postar e interagir",
      google: "Entrar com Google",
      description: "Postagens de até 127 caracteres • Comentários • Curtidas",
      features: "Comunidades • Karma • Mensagens Diretas",
      welcome: "Bem-vindo!",
      button: "🔑 Entrar com Google",
      error: "Erro ao fazer login"
    },
    banned: {
      title: "⚠️ Conta Banida",
      message: "Sua conta foi banida permanentemente do Bemtevi.",
      reason: "Motivo:",
      support: "Se você acredita que isso é um erro, entre em contato com o suporte.",
      logout: "🚪 Sair da conta"
    },
    notifications: {
      title: "🔔 Notificações",
      empty: "Nenhuma notificação",
      markAllRead: "Marcar todas como lidas",
      newLike: "Nova curtida",
      newComment: "Novo comentário",
      newFollower: "Novo seguidor",
      newLevel: "Novo Nível!",
      levelUp: "Parabéns! Você alcançou o nível"
    },
    karmaLevels: {
      Novato: "Novato",
      Iniciante: "Iniciante",
      Entusiasta: "Entusiasta",
      "Membro Ativo": "Membro Ativo",
      Veterano: "Veterano",
      Lendário: "Lendário"
    },
    feeds: {
      forYou: "Para Você",
      latest: "Últimas",
      myPosts: "Minhas"
    },
    time: {
      now: "agora",
      minute: "m",
      hour: "h",
      day: "d",
      week: "sem",
      month: "mes",
      year: "ano"
    },
    cookie: {
      title: "🍪 Nós usamos cookies",
      message: "Este site utiliza cookies para melhorar sua experiência, analisar tráfego e exibir anúncios personalizados. Ao continuar navegando, você concorda com nossa ",
      privacy: "Política de Privacidade",
      essential: "🔒 Essenciais (obrigatórios)",
      analytics: "📊 Análise de dados",
      advertising: "🎯 Publicidade personalizada",
      acceptAll: "✅ Aceitar Todos",
      rejectAll: "❌ Recusar Todos",
      customize: "⚙️ Personalizar",
      saved: "✅ Suas preferências foram salvas!",
      accepted: "✅ Todos os cookies foram aceitos!",
      rejected: "ℹ️ Cookies não essenciais foram recusados."
    },
    footer: {
      donation: "💝 Doação",
      desktop: "🖥️ Desktop",
      lgpd: "🔒 LGPD",
      marcoCivil: "📜 Marco Civil",
      ticket: "🎫 Ticket",
      products: "🛍️ Produtos",
      account: "👤 Sua conta",
      copyright: "© 2026 Bemtevi - Uma rede social livre e colaborativa",
      slogan: "Όχι, ο Χρόνος não é ο άρχοντας da γνώσης! - WazzimaGiygg"
    },
    errors: {
      generic: "Ocorreu um erro. Tente novamente.",
      network: "Erro de conexão. Verifique sua internet.",
      notFound: "Página não encontrada."
    }
  },
  'en-US': {
    app: {
      name: "Bemtevi",
      title: "Bemtevi - Social Network",
      beta: "🚧 BETA",
      description: "A free and collaborative social network"
    },
    header: {
      brand: "WazzimaGiygg",
      subtitle: "Bemtevi",
      login: "Login",
      logout: "Logout",
      profile: "Profile",
      visitor: "Visitor",
      loading: "Loading..."
    },
    nav: {
      forYou: "For You",
      myPosts: "My Posts",
      explore: "Explore",
      communities: "Communities",
      messages: "Messages",
      createCommunity: "Create Community",
      saved: "Saved",
      myProfile: "My Profile"
    },
    feed: {
      title: "📱 Feed",
      myPosts: "My Posts",
      tabs: {
        forYou: "For You",
        latest: "Latest",
        myPosts: "Mine"
      },
      empty: "No posts found!",
      loading: "Loading more posts...",
      error: "Error loading posts. Please refresh."
    },
    post: {
      placeholder: "What's happening? (Max 127 chars)",
      button: "Post 🚀",
      linkPlaceholder: "🔗 Link (optional)",
      charCounter: "0/127",
      maxLength: "Maximum 127 characters allowed!",
      empty: "Type something to post!",
      loginRequired: "Please sign in to post!",
      banned: "Your account is banned. Posting disabled.",
      success: "Post published successfully!",
      error: "Error posting. Please try again.",
      deleteConfirm: "Are you sure you want to delete this post?",
      deleteSuccess: "Post deleted successfully!",
      deleteError: "Error deleting post.",
      reportPrompt: "Describe why you are reporting:",
      reportSuccess: "Report submitted! We will review it.",
      reportError: "Error submitting report.",
      shareCopied: "Link copied to clipboard!",
      shareError: "Error copying link.",
      saved: "Post saved successfully!",
      unsaved: "Post removed from saved"
    },
    actions: {
      like: "Like",
      unlike: "Unlike",
      comment: "Comment",
      share: "Share",
      save: "Save",
      unsave: "Remove from saved",
      delete: "Delete",
      report: "Report",
      follow: "Follow",
      unfollow: "Unfollow",
      close: "Close"
    },
    comments: {
      title: "💬 Comments",
      placeholder: "Write a comment... (max 280 characters)",
      button: "Send Comment",
      empty: "No comments yet. Be the first!",
      loading: "Loading comments...",
      error: "Error loading comments",
      maxLength: "Comment too long! Max 280 characters.",
      emptyText: "Enter a comment!",
      success: "Comment posted!",
      errorSend: "Error sending comment.",
      loginRequired: "Sign in to comment!",
      banned: "Your account is banned."
    },
    categories: {
      Geral: "General",
      Tecnologia: "Technology",
      Ciência: "Science",
      Arte: "Art",
      Música: "Music",
      Esportes: "Sports",
      Games: "Games",
      Educação: "Education",
      Política: "Politics",
      Entretenimento: "Entertainment"
    },
    communities: {
      title: "🏛️ Create New Community",
      name: "Community Name *",
      namePlaceholder: "e.g. Technology, Music, Gaming...",
      nameMin: "Min 3 characters, max 50",
      description: "Description",
      descriptionPlaceholder: "Describe the community purpose...",
      category: "Category",
      button: "🚀 Create Community",
      success: "Community created successfully!",
      error: "Error creating community",
      loginRequired: "Sign in to create a community!",
      nameRequired: "Community name must have at least 3 characters.",
      members: "members",
      posts: "posts",
      join: "Join",
      leave: "Leave",
      joined: "Welcome to the community",
      left: "You left the community.",
      notFound: "Community not found."
    },
    trending: {
      title: "🔥 Trending",
      loading: "Loading...",
      empty: "Nothing trending right now",
      error: "Error loading",
      posts: "posts"
    },
    suggestions: {
      title: "👥 Suggestions",
      loading: "Loading...",
      empty: "No suggestions at the moment",
      error: "Error loading suggestions"
    },
    profile: {
      posts: "Posts",
      followers: "Followers",
      following: "Following",
      karma: "karma",
      bio: "Bio",
      noPosts: "No posts yet",
      error: "Error loading profile"
    },
    login: {
      title: "Sign in to Bemtevi",
      subtitle: "Sign in to post and engage",
      google: "Sign in with Google",
      description: "Short posts up to 127 chars • Comments • Likes",
      features: "Communities • Karma • Direct Messages",
      welcome: "Welcome!",
      button: "🔑 Sign in with Google",
      error: "Sign in failed"
    },
    banned: {
      title: "⚠️ Account Banned",
      message: "Your account has been permanently banned from Bemtevi.",
      reason: "Reason:",
      support: "If you believe this is a mistake, contact support.",
      logout: "🚪 Sign out"
    },
    notifications: {
      title: "🔔 Notifications",
      empty: "No notifications",
      markAllRead: "Mark all as read",
      newLike: "New like",
      newComment: "New comment",
      newFollower: "New follower",
      newLevel: "New Level!",
      levelUp: "Congratulations! You reached level"
    },
    karmaLevels: {
      Novato: "Newbie",
      Iniciante: "Beginner",
      Entusiasta: "Enthusiast",
      "Membro Ativo": "Active Member",
      Veterano: "Veteran",
      Lendário: "Legendary"
    },
    feeds: {
      forYou: "For You",
      latest: "Latest",
      myPosts: "Mine"
    },
    time: {
      now: "now",
      minute: "m",
      hour: "h",
      day: "d",
      week: "w",
      month: "mo",
      year: "y"
    },
    cookie: {
      title: "🍪 We use cookies",
      message: "This site uses cookies to enhance your experience, analyze traffic and deliver personalized ads. By continuing, you agree with our ",
      privacy: "Privacy Policy",
      essential: "🔒 Essential (required)",
      analytics: "📊 Analytics",
      advertising: "🎯 Personalized Ads",
      acceptAll: "✅ Accept All",
      rejectAll: "❌ Reject All",
      customize: "⚙️ Customize",
      saved: "✅ Preferences saved!",
      accepted: "✅ All cookies accepted!",
      rejected: "ℹ️ Non-essential cookies rejected."
    },
    footer: {
      donation: "💝 Donation",
      desktop: "🖥️ Desktop",
      lgpd: "🔒 LGPD",
      marcoCivil: "📜 Civil Rights",
      ticket: "🎫 Support Ticket",
      products: "🛍️ Products",
      account: "👤 Your Account",
      copyright: "© 2026 Bemtevi - A free and collaborative social network",
      slogan: "Όχι, ο Χρόνος não é ο άρχοντας da γνώσης! - WazzimaGiygg"
    },
    errors: {
      generic: "An error occurred. Please try again.",
      network: "Connection error. Check your internet.",
      notFound: "Page not found."
    }
  },
  'es-ES': {
    app: {
      name: "Bemtevi",
      title: "Bemtevi - Red Social",
      beta: "🚧 BETA",
      description: "Una red social libre y colaborativa"
    },
    header: {
      brand: "WazzimaGiygg",
      subtitle: "Bemtevi",
      login: "Iniciar sesión",
      logout: "Cerrar sesión",
      profile: "Perfil",
      visitor: "Visitante",
      loading: "Cargando..."
    },
    nav: {
      forYou: "Para Ti",
      myPosts: "Mis Publicaciones",
      explore: "Explorar",
      communities: "Comunidades",
      messages: "Mensajes",
      createCommunity: "Crear Comunidad",
      saved: "Guardados",
      myProfile: "Mi Perfil"
    },
    feed: {
      title: "📱 Feed",
      myPosts: "Mis Publicaciones",
      tabs: {
        forYou: "Para Ti",
        latest: "Últimas",
        myPosts: "Mías"
      },
      empty: "¡No se encontraron publicaciones!",
      loading: "Cargando más publicaciones...",
      error: "Error al cargar publicaciones. Recarga la página."
    },
    post: {
      placeholder: "¿Qué está pasando? (Máx. 127 caracteres)",
      button: "Publicar 🚀",
      linkPlaceholder: "🔗 Enlace (opcional)",
      charCounter: "0/127",
      maxLength: "¡Máximo 127 caracteres permitidos!",
      empty: "¡Escribe algo para publicar!",
      loginRequired: "¡Inicia sesión para publicar!",
      banned: "Tu cuenta está suspendida. No puedes publicar.",
      success: "¡Publicación enviada con éxito!",
      error: "Error al publicar. Inténtalo de nuevo.",
      deleteConfirm: "¿Seguro que deseas eliminar esta publicación?",
      deleteSuccess: "¡Publicación eliminada!",
      deleteError: "Error al eliminar publicación.",
      reportPrompt: "Describe el motivo de la denuncia:",
      reportSuccess: "¡Denuncia enviada! La revisaremos.",
      reportError: "Error al enviar denuncia.",
      shareCopied: "¡Enlace copiado al portapapeles!",
      shareError: "Error al copiar enlace.",
      saved: "¡Publicación guardada con éxito!",
      unsaved: "Publicación removida de guardados"
    },
    actions: {
      like: "Me gusta",
      unlike: "Ya no me gusta",
      comment: "Comentar",
      share: "Compartir",
      save: "Guardar",
      unsave: "Eliminar de guardados",
      delete: "Eliminar",
      report: "Denunciar",
      follow: "Seguir",
      unfollow: "Dejar de seguir",
      close: "Cerrar"
    },
    comments: {
      title: "💬 Comentarios",
      placeholder: "Escribe un comentario... (máx. 280 caracteres)",
      button: "Enviar Comentario",
      empty: "¡Aún no hay comentarios! Sé el primero.",
      loading: "Cargando comentarios...",
      error: "Error al cargar comentarios",
      maxLength: "¡Comentario demasiado largo! Máximo 280 caracteres.",
      emptyText: "¡Escribe un comentario!",
      success: "¡Comentario enviado!",
      errorSend: "Error al enviar comentario.",
      loginRequired: "¡Inicia sesión para comentar!",
      banned: "Tu cuenta está suspendida."
    },
    categories: {
      Geral: "General",
      Tecnologia: "Tecnología",
      Ciência: "Ciencia",
      Arte: "Arte",
      Música: "Música",
      Esportes: "Deportes",
      Games: "Juegos",
      Educação: "Educación",
      Política: "Política",
      Entretenimento: "Entretenimiento"
    },
    communities: {
      title: "🏛️ Crear Nueva Comunidad",
      name: "Nombre de la Comunidad *",
      namePlaceholder: "Ej: Tecnología, Música, Juegos...",
      nameMin: "Mínimo 3 caracteres, máximo 50",
      description: "Descripción",
      descriptionPlaceholder: "Describe el propósito de la comunidad...",
      category: "Categoría",
      button: "🚀 Crear Comunidad",
      success: "¡Comunidad creada con éxito!",
      error: "Error al crear comunidad",
      loginRequired: "¡Inicia sesión para crear una comunidad!",
      nameRequired: "El nombre debe tener al menos 3 caracteres.",
      members: "miembros",
      posts: "publicaciones",
      join: "Unirse",
      leave: "Salir",
      joined: "Bienvenido a la comunidad",
      left: "Saliste de la comunidad.",
      notFound: "Comunidad no encontrada."
    },
    trending: {
      title: "🔥 Tendencias",
      loading: "Cargando...",
      empty: "Sin tendencias en este momento",
      error: "Error al cargar",
      posts: "publicaciones"
    },
    suggestions: {
      title: "👥 Sugerencias",
      loading: "Cargando...",
      empty: "Sin sugerencias por el momento",
      error: "Error al cargar sugerencias"
    },
    profile: {
      posts: "Publicaciones",
      followers: "Seguidores",
      following: "Siguiendo",
      karma: "karma",
      bio: "Biografía",
      noPosts: "Sin publicaciones aún",
      error: "Error al cargar perfil"
    },
    login: {
      title: "Iniciar sesión en Bemtevi",
      subtitle: "Inicia sesión para publicar e interactuar",
      google: "Iniciar con Google",
      description: "Mensajes cortos de hasta 127 caracteres • Comentarios • Me gusta",
      features: "Comunidades • Karma • Mensajes Directos",
      welcome: "¡Bienvenido!",
      button: "🔑 Iniciar con Google",
      error: "Error al iniciar sesión"
    },
    banned: {
      title: "⚠️ Cuenta Suspendida",
      message: "Tu cuenta ha sido suspendida permanentemente de Bemtevi.",
      reason: "Motivo:",
      support: "Si crees que esto es un error, contacta al soporte.",
      logout: "🚪 Cerrar sesión"
    },
    notifications: {
      title: "🔔 Notificaciones",
      empty: "Sin notificaciones",
      markAllRead: "Marcar todas como leídas",
      newLike: "Nuevo me gusta",
      newComment: "Nuevo comentario",
      newFollower: "Nuevo seguidor",
      newLevel: "¡Nuevo Nivel!",
      levelUp: "¡Felicidades! Alcanzaste el nivel"
    },
    karmaLevels: {
      Novato: "Novato",
      Iniciante: "Principiante",
      Entusiasta: "Entusiasta",
      "Membro Ativo": "Miembro Activo",
      Veterano: "Veterano",
      Lendário: "Legendario"
    },
    feeds: {
      forYou: "Para Ti",
      latest: "Últimas",
      myPosts: "Mías"
    },
    time: {
      now: "ahora",
      minute: "m",
      hour: "h",
      day: "d",
      week: "sem",
      month: "mes",
      year: "año"
    },
    cookie: {
      title: "🍪 Usamos cookies",
      message: "Este sitio utiliza cookies para mejorar tu experiencia, analizar el tráfico y mostrar anuncios personalizados. Al continuar navegando, aceptas nuestra ",
      privacy: "Política de Privacidad",
      essential: "🔒 Esenciales (obligatorias)",
      analytics: "📊 Análisis de datos",
      advertising: "🎯 Publicidad personalizada",
      acceptAll: "✅ Aceptar Todo",
      rejectAll: "❌ Rechazar Todo",
      customize: "⚙️ Personalizar",
      saved: "✅ ¡Preferencias guardadas!",
      accepted: "✅ ¡Todas las cookies aceptadas!",
      rejected: "ℹ️ Cookies no esenciales rechazadas."
    },
    footer: {
      donation: "💝 Donación",
      desktop: "🖥️ Escritorio",
      lgpd: "🔒 Privacidad / LGPD",
      marcoCivil: "📜 Marco Legal",
      ticket: "🎫 Ticket de Soporte",
      products: "🛍️ Productos",
      account: "👤 Tu cuenta",
      copyright: "© 2026 Bemtevi - Una red social libre y colaborativa",
      slogan: "Όχι, ο Χρόνος não é ο άρχοντας da γνώσης! - WazzimaGiygg"
    },
    errors: {
      generic: "Ocurrió un error. Inténtalo de nuevo.",
      network: "Error de conexión. Verifica tu internet.",
      notFound: "Página no encontrada."
    }
  }
} as const;

export function getTranslation(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const locDict = translations[locale] || translations['pt-BR'];
  const parts = key.split('.');
  let current: any = locDict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // fallback to pt-BR
      let fallbackCurrent: any = translations['pt-BR'];
      for (const fbPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fbPart];
        } else {
          return key;
        }
      }
      current = fallbackCurrent;
      break;
    }
  }

  if (typeof current !== 'string') return key;

  if (params) {
    return Object.entries(params).reduce((str, [pKey, pVal]) => {
      return str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    }, current);
  }

  return current;
}
