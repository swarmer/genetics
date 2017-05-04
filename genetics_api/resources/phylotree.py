import subprocess
import tempfile

from Bio import Phylo
import pylab


def encode_for_clustal(name):
    return name.replace(' ', '_')


def unfuck_clustal_name(name):
    return name.replace('_', ' ')


def get_tree_bytes(pairs):
    with tempfile.NamedTemporaryFile(mode='w') as clustal_input, \
            tempfile.NamedTemporaryFile(mode='r') as phylogeny_input:
        for name, sequence in pairs:
            clustal_input.write('> %s\n%s\n\n' % (encode_for_clustal(name), sequence))
        clustal_input.flush()

        subprocess.check_call([
            '/clustalo', '-i', clustal_input.name, '--outfmt=clu', '-o', phylogeny_input.name
        ])

        subprocess.check_call([
            'cat', phylogeny_input.name
        ])


def draw_tree(input_path, output_path):
    tree = Phylo.read(input_path, 'newick')
    pylab.savefig(output_path)
