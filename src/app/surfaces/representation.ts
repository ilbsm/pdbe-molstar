import { ParamDefinition as PD } from 'Molstar/mol-util/param-definition';
import { Representation, RepresentationContext, RepresentationParamsGetter } from 'Molstar/mol-repr/representation';
import { Vec3 } from 'Molstar/mol-math/linear-algebra/3d';
import { MeshBuilder } from 'Molstar/mol-geo/geometry/mesh/mesh-builder';
import { RuntimeContext } from 'Molstar/mol-task';
import { ShapeRepresentation } from 'Molstar/mol-repr/shape/representation';
import { Color } from 'Molstar/mol-util/color/color';
import { Mesh } from 'Molstar/mol-geo/geometry/mesh/mesh';
import { Shape } from 'Molstar/mol-model/shape/shape';
import { BaseGeometry } from 'Molstar/mol-geo/geometry/base';


interface SurfaceData {
    triangles: Array<Array<Array<number>>>,
    size: number
    index: number
    color: Color
}

export const SurfaceParams = {
    ...Mesh.Params,
    doubleSided: PD.Boolean(true),
    // flipSided: PD.Boolean(true),
    xrayShaded: PD.Boolean(false),
    // alpha: PD.Numeric(60),
    transparentBackfaces: PD.Select('on', PD.arrayToOptions(['off', 'on', 'opaque'] as const), BaseGeometry.ShadingCategory), // 'on' means: show backfaces with correct opacity, even when opacity < 1 (requires doubleSided) ¯\_(ツ)_/¯
};
export type SurfaceParams = typeof SurfaceParams;
export type SurfaceProps = PD.Values<SurfaceParams>

const SurfaceVisuals = {
    'mesh': (ctx: RepresentationContext, getParams: RepresentationParamsGetter<SurfaceData, SurfaceParams>) => ShapeRepresentation(getSurfaceShape, Mesh.Utils)
};

function getSurfaceMesh(data: SurfaceData, props: SurfaceProps, mesh?: Mesh) {
    const state = MeshBuilder.createState(256, 128, mesh);
    state.currentGroup = data.index;
    for (const triangle of data.triangles) {
        MeshBuilder.addTriangle(state,
            Vec3.create(triangle[0][0], triangle[0][1], triangle[0][2]),
            Vec3.create(triangle[1][0], triangle[1][1], triangle[1][2]),
            Vec3.create(triangle[2][0], triangle[2][1], triangle[2][2]),
        );
    }
    return MeshBuilder.getMesh(state);
}

function getSurfaceShape(ctx: RuntimeContext, data: SurfaceData, props: SurfaceProps, shape?: Shape<Mesh>) {
    const geo = getSurfaceMesh(data, props, shape && shape.geometry);
    return Shape.create(`Surface ${data.index}`, data, geo, () => data.color, () => data.size, () => `Surface ${data.index}`);
}
export type SurfaceRepresentation = Representation<SurfaceData, SurfaceParams>

export function SurfaceRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<SurfaceData, SurfaceParams>): SurfaceRepresentation {
    return Representation.createMulti('Surface', ctx, getParams, Representation.StateBuilder, SurfaceVisuals as unknown as Representation.Def<SurfaceData, SurfaceParams>);
}