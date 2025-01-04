import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
  Link
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  Comment as CommentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wordpress-tabpanel-${index}`}
      aria-labelledby={`wordpress-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const WordPressIntegration = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editItem, setEditItem] = useState(null);

  // Form states
  const [siteUrl, setSiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postStatus, setPostStatus] = useState('draft');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wordpress/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteUrl,
          username,
          password
        }),
      });

      if (!response.ok) {
        throw new Error('Verbinding mislukt');
      }

      const data = await response.json();
      setSites([...sites, { siteUrl, username }]);
      setSelectedSite(siteUrl);
      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    if (!selectedSite) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wordpress/${selectedSite}/posts?page=${page + 1}&perPage=${rowsPerPage}`);
      
      if (!response.ok) {
        throw new Error('Kon posts niet ophalen');
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!selectedSite) return;

    try {
      const response = await fetch(`/api/wordpress/${selectedSite}/categories`);
      
      if (!response.ok) {
        throw new Error('Kon categorieën niet ophalen');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTags = async () => {
    if (!selectedSite) return;

    try {
      const response = await fetch(`/api/wordpress/${selectedSite}/tags`);
      
      if (!response.ok) {
        throw new Error('Kon tags niet ophalen');
      }

      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMedia = async () => {
    if (!selectedSite) return;

    try {
      const response = await fetch(`/api/wordpress/${selectedSite}/media`);
      
      if (!response.ok) {
        throw new Error('Kon media niet ophalen');
      }

      const data = await response.json();
      setMedia(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreatePost = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wordpress/${selectedSite}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          status: postStatus,
          categories: selectedCategories,
          tags: selectedTags
        }),
      });

      if (!response.ok) {
        throw new Error('Kon post niet aanmaken');
      }

      await fetchPosts();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editItem) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wordpress/${selectedSite}/posts/${editItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
          status: postStatus,
          categories: selectedCategories,
          tags: selectedTags
        }),
      });

      if (!response.ok) {
        throw new Error('Kon post niet bijwerken');
      }

      await fetchPosts();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Weet je zeker dat je deze post wilt verwijderen?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wordpress/${selectedSite}/posts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Kon post niet verwijderen');
      }

      await fetchPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPostTitle('');
    setPostContent('');
    setPostStatus('draft');
    setSelectedCategories([]);
    setSelectedTags([]);
    setEditItem(null);
  };

  const handleEditPost = (post) => {
    setEditItem(post);
    setPostTitle(post.title.rendered);
    setPostContent(post.content.rendered);
    setPostStatus(post.status);
    setSelectedCategories(post.categories);
    setSelectedTags(post.tags);
    setDialogType('editPost');
    setOpenDialog(true);
  };

  useEffect(() => {
    if (selectedSite) {
      fetchPosts();
      fetchCategories();
      fetchTags();
      fetchMedia();
    }
  }, [selectedSite, page, rowsPerPage]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        WordPress Integratie
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Site Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                select
                fullWidth
                label="WordPress Site"
                value={selectedSite || ''}
                onChange={(e) => setSelectedSite(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Selecteer een site</option>
                {sites.map((site) => (
                  <option key={site.siteUrl} value={site.siteUrl}>
                    {site.siteUrl}
                  </option>
                ))}
              </TextField>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setDialogType('connect');
                  setOpenDialog(true);
                }}
              >
                Nieuwe Site
              </Button>
            </Box>
          </Paper>
        </Grid>

        {selectedSite && (
          <Grid item xs={12}>
            <Paper>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab icon={<EditIcon />} label="Posts" />
                <Tab icon={<CategoryIcon />} label="Categorieën" />
                <Tab icon={<TagIcon />} label="Tags" />
                <Tab icon={<ImageIcon />} label="Media" />
              </Tabs>

              {/* Posts Tab */}
              <TabPanel value={activeTab} index={0}>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setDialogType('createPost');
                      setOpenDialog(true);
                    }}
                  >
                    Nieuwe Post
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Titel</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Auteur</TableCell>
                        <TableCell>Datum</TableCell>
                        <TableCell align="right">Acties</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>{post.title.rendered}</TableCell>
                          <TableCell>
                            <Chip
                              label={post.status}
                              color={post.status === 'publish' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{post.author}</TableCell>
                          <TableCell>
                            {new Date(post.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() => handleEditPost(post)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeletePost(post.id)}
                              size="small"
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={-1}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </TabPanel>

              {/* Categories Tab */}
              <TabPanel value={activeTab} index={1}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Naam</TableCell>
                        <TableCell>Slug</TableCell>
                        <TableCell align="right">Aantal Posts</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.slug}</TableCell>
                          <TableCell align="right">{category.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* Tags Tab */}
              <TabPanel value={activeTab} index={2}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Naam</TableCell>
                        <TableCell>Slug</TableCell>
                        <TableCell align="right">Aantal Posts</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tags.map((tag) => (
                        <TableRow key={tag.id}>
                          <TableCell>{tag.name}</TableCell>
                          <TableCell>{tag.slug}</TableCell>
                          <TableCell align="right">{tag.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* Media Tab */}
              <TabPanel value={activeTab} index={3}>
                <Grid container spacing={2}>
                  {media.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                      <Card>
                        <CardContent>
                          {item.media_type === 'image' ? (
                            <img
                              src={item.source_url}
                              alt={item.alt_text}
                              style={{ width: '100%', height: 'auto' }}
                            />
                          ) : (
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              height={200}
                              bgcolor="grey.200"
                            >
                              <Typography>{item.media_type}</Typography>
                            </Box>
                          )}
                          <Typography variant="body2" noWrap>
                            {item.title.rendered}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Dialogs */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'connect' && 'Nieuwe WordPress Site Verbinden'}
          {dialogType === 'createPost' && 'Nieuwe Post Aanmaken'}
          {dialogType === 'editPost' && 'Post Bewerken'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'connect' && (
            <Box display="flex" flexDirection="column" gap={2} pt={2}>
              <TextField
                label="Site URL"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                fullWidth
              />
              <TextField
                label="Gebruikersnaam"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
              />
              <TextField
                label="Wachtwoord"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
            </Box>
          )}

          {(dialogType === 'createPost' || dialogType === 'editPost') && (
            <Box display="flex" flexDirection="column" gap={2} pt={2}>
              <TextField
                label="Titel"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                fullWidth
              />
              <Editor
                apiKey="your-tinymce-api-key"
                value={postContent}
                onEditorChange={(content) => setPostContent(content)}
                init={{
                  height: 400,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help'
                }}
              />
              <TextField
                select
                label="Status"
                value={postStatus}
                onChange={(e) => setPostStatus(e.target.value)}
                fullWidth
              >
                <option value="draft">Concept</option>
                <option value="publish">Publiceren</option>
                <option value="private">Privé</option>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              resetForm();
            }}
          >
            Annuleren
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (dialogType === 'connect') handleConnect();
              if (dialogType === 'createPost') handleCreatePost();
              if (dialogType === 'editPost') handleUpdatePost();
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Opslaan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WordPressIntegration;
